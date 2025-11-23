import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, Like, IsNull, Not } from 'typeorm';
import { RSSFeed } from '../entities/rss-feed.entity';
import { RSSItem } from '../entities/rss-item.entity';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { UpdateFeedDto } from '../dto/update-feed.dto';
import { FeedQueryDto, ItemQueryDto, MapItemsQueryDto } from '../dto/feed-query.dto';
import { RSSParserService } from './rss-parser.service';
import { GeocodingService } from './geocoding.service';

@Injectable()
export class RSSService {
  private readonly logger = new Logger(RSSService.name);

  constructor(
    @InjectRepository(RSSFeed)
    private feedsRepository: Repository<RSSFeed>,
    @InjectRepository(RSSItem)
    private itemsRepository: Repository<RSSItem>,
    private rssParserService: RSSParserService,
    private geocodingService: GeocodingService,
  ) {}

  // ===== Feed Management =====

  async createFeed(userId: string, createFeedDto: CreateFeedDto): Promise<RSSFeed> {
    // Validate the feed URL
    const isValid = await this.rssParserService.validateFeedUrl(createFeedDto.url);
    if (!isValid) {
      throw new Error('Invalid RSS feed URL or unable to fetch feed');
    }

    const feed = this.feedsRepository.create({
      ...createFeedDto,
      userId,
    });
    const savedFeed = await this.feedsRepository.save(feed);

    // Fetch initial items
    await this.refreshFeed(userId, savedFeed.id);

    return savedFeed;
  }

  async findAllFeeds(userId: string, query?: FeedQueryDto): Promise<RSSFeed[]> {
    const where: any = { userId };

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.subtype) {
      where.subtype = query.subtype;
    }

    if (query?.enabled !== undefined) {
      where.enabled = query.enabled;
    }

    return this.feedsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOneFeed(userId: string, id: string): Promise<RSSFeed> {
    const feed = await this.feedsRepository.findOne({
      where: { id, userId },
      relations: ['items'],
    });

    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }

    return feed;
  }

  async updateFeed(userId: string, id: string, updateFeedDto: UpdateFeedDto): Promise<RSSFeed> {
    const feed = await this.findOneFeed(userId, id);

    // If URL is being updated, validate it
    if (updateFeedDto.url && updateFeedDto.url !== feed.url) {
      const isValid = await this.rssParserService.validateFeedUrl(updateFeedDto.url);
      if (!isValid) {
        throw new Error('Invalid RSS feed URL or unable to fetch feed');
      }
    }

    Object.assign(feed, updateFeedDto);
    return this.feedsRepository.save(feed);
  }

  async removeFeed(userId: string, id: string): Promise<void> {
    const feed = await this.findOneFeed(userId, id);
    await this.feedsRepository.remove(feed);
  }

  // ===== Feed Refresh =====

  async refreshFeed(userId: string, id: string): Promise<number> {
    const feed = await this.findOneFeed(userId, id);

    try {
      this.logger.log(`Refreshing feed: ${feed.name}`);

      const parsedFeed = await this.rssParserService.parseFeed(feed.url);
      let newItemsCount = 0;

      for (const parsedItem of parsedFeed.items) {
        // Check if item already exists
        const exists = await this.itemsRepository.findOne({
          where: { guid: parsedItem.guid },
        });

        if (exists) {
          continue; // Skip existing items
        }

        // Create new item
        const item = this.itemsRepository.create({
          feedId: feed.id,
          title: parsedItem.title,
          description: parsedItem.description,
          link: parsedItem.link,
          pubDate: parsedItem.pubDate,
          guid: parsedItem.guid,
          author: parsedItem.author,
          categories: parsedItem.categories,
          imageUrl: parsedItem.imageUrl,
          contentSnippet: parsedItem.contentSnippet,
          latitude: parsedItem.geoLat || null,
          longitude: parsedItem.geoLong || null,
          geocoded: !!(parsedItem.geoLat && parsedItem.geoLong),
        });

        // Attempt to geocode if enabled and no coords found
        if (feed.geocodingEnabled && !item.geocoded) {
          const geoResult = await this.geocodingService.geocodeItem(
            parsedItem.title,
            parsedItem.description || '',
          );

          if (geoResult) {
            item.latitude = geoResult.latitude;
            item.longitude = geoResult.longitude;
            item.location = geoResult.location;
            item.geocoded = true;
          }
        }

        await this.itemsRepository.save(item);
        newItemsCount++;
      }

      // Update feed metadata
      feed.lastFetched = new Date();
      feed.lastError = null;
      feed.itemCount = await this.itemsRepository.count({ where: { feedId: feed.id } });
      await this.feedsRepository.save(feed);

      this.logger.log(`Refreshed ${feed.name}: ${newItemsCount} new items`);
      return newItemsCount;
    } catch (error) {
      this.logger.error(`Failed to refresh feed ${feed.name}: ${error.message}`);

      // Update error status
      feed.lastError = error.message;
      await this.feedsRepository.save(feed);

      throw error;
    }
  }

  async refreshAllFeeds(userId: string): Promise<void> {
    const feeds = await this.feedsRepository.find({
      where: { userId, enabled: true }
    });

    this.logger.log(`Refreshing ${feeds.length} feeds for user ${userId}...`);

    for (const feed of feeds) {
      try {
        await this.refreshFeed(userId, feed.id);
      } catch (error) {
        // Continue to next feed on error
        this.logger.error(`Error refreshing feed ${feed.id}: ${error.message}`);
      }
    }

    this.logger.log(`All feeds refreshed for user ${userId}`);
  }

  // ===== Item Management =====

  async findAllItems(userId: string, query: ItemQueryDto): Promise<{ items: RSSItem[]; total: number }> {
    const where: any = {};
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    // Get user's feed IDs first to scope items to user
    const userFeeds = await this.feedsRepository.find({
      where: { userId },
      select: ['id']
    });
    const userFeedIds = userFeeds.map(f => f.id);

    if (userFeedIds.length === 0) {
      return { items: [], total: 0 };
    }

    // Start with user's feeds
    where.feedId = In(userFeedIds);

    // Further filter by specific feed IDs if provided
    if (query.feedIds && query.feedIds.length > 0) {
      // Intersect with user's feeds for security
      const allowedFeedIds = query.feedIds.filter(id => userFeedIds.includes(id));
      if (allowedFeedIds.length > 0) {
        where.feedId = In(allowedFeedIds);
      } else {
        return { items: [], total: 0 };
      }
    }

    // Filter by geocoded status
    if (query.geocoded !== undefined) {
      where.geocoded = query.geocoded;
    }

    // Filter by read status
    if (query.read !== undefined) {
      where.read = query.read;
    }

    // Filter by starred status
    if (query.starred !== undefined) {
      where.starred = query.starred;
    }

    // Filter by date range
    if (query.since || query.until) {
      const dateFilter: any = {};
      if (query.since) {
        dateFilter.pubDate = Between(new Date(query.since), query.until ? new Date(query.until) : new Date());
      }
      where.pubDate = dateFilter.pubDate;
    }

    // Search in title/description
    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    // Get feeds matching type/subtype filters
    if (query.types || query.subtypes) {
      const feedWhere: any = { userId };
      if (query.types) {
        feedWhere.type = In(query.types);
      }
      if (query.subtypes) {
        feedWhere.subtype = In(query.subtypes);
      }

      const matchingFeeds = await this.feedsRepository.find({ where: feedWhere });
      const feedIds = matchingFeeds.map((f) => f.id);

      if (feedIds.length > 0) {
        where.feedId = In(feedIds);
      } else {
        // No matching feeds, return empty
        return { items: [], total: 0 };
      }
    }

    const [items, total] = await this.itemsRepository.findAndCount({
      where,
      relations: ['feed'],
      order: { pubDate: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total };
  }

  async findOneItem(userId: string, id: string): Promise<RSSItem> {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: ['feed'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    // Verify user owns the feed
    if (item.feed.userId !== userId) {
      throw new ForbiddenException('Access denied to this item');
    }

    return item;
  }

  async markAsRead(userId: string, id: string, read: boolean): Promise<RSSItem> {
    const item = await this.findOneItem(userId, id);
    item.read = read;
    return this.itemsRepository.save(item);
  }

  async toggleStar(userId: string, id: string): Promise<RSSItem> {
    const item = await this.findOneItem(userId, id);
    item.starred = !item.starred;
    return this.itemsRepository.save(item);
  }

  async removeItem(userId: string, id: string): Promise<void> {
    const item = await this.findOneItem(userId, id);
    await this.itemsRepository.remove(item);
  }

  // ===== Map Data =====

  async getMapItems(userId: string, query: MapItemsQueryDto): Promise<RSSItem[]> {
    const where: any = {
      geocoded: true,
      latitude: Not(IsNull()),
      longitude: Not(IsNull()),
    };

    // Get user's feeds
    const userFeeds = await this.feedsRepository.find({
      where: { userId },
      select: ['id']
    });
    const userFeedIds = userFeeds.map(f => f.id);

    if (userFeedIds.length === 0) {
      return [];
    }

    where.feedId = In(userFeedIds);

    // Apply filters
    if (query.types || query.subtypes) {
      const feedWhere: any = { userId };
      if (query.types) {
        feedWhere.type = In(query.types);
      }
      if (query.subtypes) {
        feedWhere.subtype = In(query.subtypes);
      }

      const matchingFeeds = await this.feedsRepository.find({ where: feedWhere });
      const feedIds = matchingFeeds.map((f) => f.id);

      if (feedIds.length > 0) {
        where.feedId = In(feedIds);
      } else {
        return [];
      }
    }

    // Filter by date
    if (query.since) {
      where.pubDate = Between(new Date(query.since), query.until ? new Date(query.until) : new Date());
    }

    // Get items
    let items = await this.itemsRepository.find({
      where,
      relations: ['feed'],
      order: { pubDate: 'DESC' },
      take: query.limit || 500,
    });

    // Filter by map bounds if provided
    if (query.bounds) {
      items = items.filter((item) => {
        return (
          item.latitude >= query.bounds.south &&
          item.latitude <= query.bounds.north &&
          item.longitude >= query.bounds.west &&
          item.longitude <= query.bounds.east
        );
      });
    }

    return items;
  }

  // ===== Statistics =====

  async getStats(userId: string): Promise<{
    totalFeeds: number;
    totalItems: number;
    geocodedItems: number;
    unreadItems: number;
  }> {
    const userFeeds = await this.feedsRepository.find({
      where: { userId },
      select: ['id']
    });
    const userFeedIds = userFeeds.map(f => f.id);

    if (userFeedIds.length === 0) {
      return {
        totalFeeds: 0,
        totalItems: 0,
        geocodedItems: 0,
        unreadItems: 0,
      };
    }

    const [totalItems, geocodedItems, unreadItems] = await Promise.all([
      this.itemsRepository.count({ where: { feedId: In(userFeedIds) } }),
      this.itemsRepository.count({ where: { feedId: In(userFeedIds), geocoded: true } }),
      this.itemsRepository.count({ where: { feedId: In(userFeedIds), read: false } }),
    ]);

    return {
      totalFeeds: userFeeds.length,
      totalItems,
      geocodedItems,
      unreadItems,
    };
  }
}
