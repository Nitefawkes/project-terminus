import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  async createFeed(createFeedDto: CreateFeedDto): Promise<RSSFeed> {
    // Validate the feed URL
    const isValid = await this.rssParserService.validateFeedUrl(createFeedDto.url);
    if (!isValid) {
      throw new Error('Invalid RSS feed URL or unable to fetch feed');
    }

    const feed = this.feedsRepository.create(createFeedDto);
    const savedFeed = await this.feedsRepository.save(feed);

    // Fetch initial items
    await this.refreshFeed(savedFeed.id);

    return savedFeed;
  }

  async findAllFeeds(query?: FeedQueryDto): Promise<RSSFeed[]> {
    const where: any = {};

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

  async findOneFeed(id: string): Promise<RSSFeed> {
    const feed = await this.feedsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }

    return feed;
  }

  async updateFeed(id: string, updateFeedDto: UpdateFeedDto): Promise<RSSFeed> {
    const feed = await this.findOneFeed(id);

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

  async removeFeed(id: string): Promise<void> {
    const feed = await this.findOneFeed(id);
    await this.feedsRepository.remove(feed);
  }

  // ===== Feed Refresh =====

  async refreshFeed(id: string): Promise<number> {
    const feed = await this.findOneFeed(id);

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

  async refreshAllFeeds(): Promise<void> {
    const feeds = await this.feedsRepository.find({ where: { enabled: true } });

    this.logger.log(`Refreshing ${feeds.length} feeds...`);

    for (const feed of feeds) {
      try {
        await this.refreshFeed(feed.id);
      } catch (error) {
        // Continue to next feed on error
        this.logger.error(`Error refreshing feed ${feed.id}: ${error.message}`);
      }
    }

    this.logger.log('All feeds refreshed');
  }

  // ===== Item Management =====

  async findAllItems(query: ItemQueryDto): Promise<{ items: RSSItem[]; total: number }> {
    const where: any = {};
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    // Filter by feed IDs
    if (query.feedIds && query.feedIds.length > 0) {
      where.feedId = In(query.feedIds);
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
      const feedWhere: any = {};
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

  async findOneItem(id: string): Promise<RSSItem> {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: ['feed'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async markAsRead(id: string, read: boolean): Promise<RSSItem> {
    const item = await this.findOneItem(id);
    item.read = read;
    return this.itemsRepository.save(item);
  }

  async toggleStar(id: string): Promise<RSSItem> {
    const item = await this.findOneItem(id);
    item.starred = !item.starred;
    return this.itemsRepository.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.findOneItem(id);
    await this.itemsRepository.remove(item);
  }

  // ===== Map Data =====

  async getMapItems(query: MapItemsQueryDto): Promise<RSSItem[]> {
    const where: any = {
      geocoded: true,
      latitude: Not(IsNull()),
      longitude: Not(IsNull()),
    };

    // Apply filters
    if (query.types || query.subtypes) {
      const feedWhere: any = {};
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
}
