import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FeedCollection } from '../entities/feed-collection.entity';
import { RSSFeed } from '../entities/rss-feed.entity';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddFeedsToCollectionDto,
  RemoveFeedsFromCollectionDto,
} from '../dto/collection.dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(FeedCollection)
    private readonly collectionsRepository: Repository<FeedCollection>,
    @InjectRepository(RSSFeed)
    private readonly feedsRepository: Repository<RSSFeed>,
  ) {}

  /**
   * Create a new collection
   */
  async createCollection(
    userId: string,
    dto: CreateCollectionDto,
  ): Promise<FeedCollection> {
    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.collectionsRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const collection = this.collectionsRepository.create({
      ...dto,
      userId,
      feeds: [], // Will add feeds separately if provided
    });

    const savedCollection = await this.collectionsRepository.save(collection);

    // Add initial feeds if provided
    if (dto.feedIds && dto.feedIds.length > 0) {
      await this.addFeedsToCollection(userId, savedCollection.id, {
        feedIds: dto.feedIds,
      });
      // Reload with feeds
      return this.findOneCollection(userId, savedCollection.id);
    }

    return savedCollection;
  }

  /**
   * Get all collections for a user
   */
  async findAllCollections(userId: string): Promise<FeedCollection[]> {
    return this.collectionsRepository.find({
      where: { userId },
      relations: ['feeds'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get a single collection
   */
  async findOneCollection(
    userId: string,
    id: string,
  ): Promise<FeedCollection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id, userId },
      relations: ['feeds'],
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  /**
   * Get the default collection for a user
   */
  async findDefaultCollection(userId: string): Promise<FeedCollection | null> {
    return this.collectionsRepository.findOne({
      where: { userId, isDefault: true },
      relations: ['feeds'],
    });
  }

  /**
   * Update a collection
   */
  async updateCollection(
    userId: string,
    id: string,
    dto: UpdateCollectionDto,
  ): Promise<FeedCollection> {
    const collection = await this.findOneCollection(userId, id);

    // If setting as default, unset other defaults
    if (dto.isDefault && !collection.isDefault) {
      await this.collectionsRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(collection, dto);
    return this.collectionsRepository.save(collection);
  }

  /**
   * Delete a collection
   */
  async deleteCollection(userId: string, id: string): Promise<void> {
    const collection = await this.findOneCollection(userId, id);
    await this.collectionsRepository.remove(collection);
  }

  /**
   * Add feeds to a collection
   */
  async addFeedsToCollection(
    userId: string,
    collectionId: string,
    dto: AddFeedsToCollectionDto,
  ): Promise<FeedCollection> {
    const collection = await this.findOneCollection(userId, collectionId);

    // Verify all feeds belong to the user
    const feeds = await this.feedsRepository.find({
      where: { id: In(dto.feedIds), userId },
    });

    if (feeds.length !== dto.feedIds.length) {
      throw new BadRequestException(
        'Some feeds not found or do not belong to you',
      );
    }

    // Get current feed IDs to avoid duplicates
    const currentFeedIds = collection.feeds.map((f) => f.id);
    const newFeeds = feeds.filter((f) => !currentFeedIds.includes(f.id));

    if (newFeeds.length > 0) {
      collection.feeds.push(...newFeeds);
      await this.collectionsRepository.save(collection);
    }

    return this.findOneCollection(userId, collectionId);
  }

  /**
   * Remove feeds from a collection
   */
  async removeFeedsFromCollection(
    userId: string,
    collectionId: string,
    dto: RemoveFeedsFromCollectionDto,
  ): Promise<FeedCollection> {
    const collection = await this.findOneCollection(userId, collectionId);

    collection.feeds = collection.feeds.filter(
      (feed) => !dto.feedIds.includes(feed.id),
    );

    await this.collectionsRepository.save(collection);
    return this.findOneCollection(userId, collectionId);
  }

  /**
   * Get all collections that contain a specific feed
   */
  async findCollectionsByFeed(
    userId: string,
    feedId: string,
  ): Promise<FeedCollection[]> {
    return this.collectionsRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.feeds', 'feed')
      .where('collection.userId = :userId', { userId })
      .andWhere('feed.id = :feedId', { feedId })
      .orderBy('collection.sortOrder', 'ASC')
      .addOrderBy('collection.name', 'ASC')
      .getMany();
  }

  /**
   * Get feed IDs for a collection
   */
  async getFeedIdsForCollection(
    userId: string,
    collectionId: string,
  ): Promise<string[]> {
    const collection = await this.findOneCollection(userId, collectionId);
    return collection.feeds.map((f) => f.id);
  }
}
