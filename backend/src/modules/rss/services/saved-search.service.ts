import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from '../entities/saved-search.entity';
import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from '../dto/saved-search.dto';

@Injectable()
export class SavedSearchService {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly savedSearchRepository: Repository<SavedSearch>,
  ) {}

  /**
   * Create a new saved search
   */
  async createSavedSearch(
    userId: string,
    dto: CreateSavedSearchDto,
  ): Promise<SavedSearch> {
    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.savedSearchRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const savedSearch = this.savedSearchRepository.create({
      ...dto,
      userId,
    });

    return this.savedSearchRepository.save(savedSearch);
  }

  /**
   * Get all saved searches for a user
   */
  async findAllSavedSearches(userId: string): Promise<SavedSearch[]> {
    return this.savedSearchRepository.find({
      where: { userId },
      order: { isPinned: 'DESC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get a single saved search
   */
  async findOneSavedSearch(
    userId: string,
    id: string,
  ): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, userId },
    });

    if (!savedSearch) {
      throw new NotFoundException(`Saved search with ID ${id} not found`);
    }

    // Update last used timestamp
    savedSearch.lastUsedAt = new Date();
    await this.savedSearchRepository.save(savedSearch);

    return savedSearch;
  }

  /**
   * Get the default saved search for a user
   */
  async findDefaultSavedSearch(userId: string): Promise<SavedSearch | null> {
    return this.savedSearchRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  /**
   * Get pinned saved searches for quick access
   */
  async findPinnedSavedSearches(userId: string): Promise<SavedSearch[]> {
    return this.savedSearchRepository.find({
      where: { userId, isPinned: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    userId: string,
    id: string,
    dto: UpdateSavedSearchDto,
  ): Promise<SavedSearch> {
    const savedSearch = await this.findOneSavedSearch(userId, id);

    // If setting as default, unset other defaults
    if (dto.isDefault && !savedSearch.isDefault) {
      await this.savedSearchRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(savedSearch, dto);
    return this.savedSearchRepository.save(savedSearch);
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(userId: string, id: string): Promise<void> {
    const savedSearch = await this.findOneSavedSearch(userId, id);
    await this.savedSearchRepository.remove(savedSearch);
  }

  /**
   * Apply a saved search (returns filters)
   */
  async applySavedSearch(userId: string, id: string): Promise<object> {
    const savedSearch = await this.findOneSavedSearch(userId, id);
    return savedSearch.filters;
  }
}
