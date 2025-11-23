import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RSSService } from './services/rss.service';
import { CollectionService } from './services/collection.service';
import { ExportService } from './services/export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { FeedQueryDto, ItemQueryDto, MapItemsQueryDto } from './dto/feed-query.dto';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddFeedsToCollectionDto,
  RemoveFeedsFromCollectionDto,
} from './dto/collection.dto';
import { ExportItemsDto } from './dto/export.dto';

@Controller('rss')
@UseGuards(JwtAuthGuard)
export class RSSController {
  constructor(
    private readonly rssService: RSSService,
    private readonly collectionService: CollectionService,
    private readonly exportService: ExportService,
  ) {}

  // ===== Feed Management =====

  @Post('feeds')
  async createFeed(
    @GetUser('id') userId: string,
    @Body() createFeedDto: CreateFeedDto,
  ) {
    return this.rssService.createFeed(userId, createFeedDto);
  }

  @Get('feeds')
  async getAllFeeds(
    @GetUser('id') userId: string,
    @Query() query: FeedQueryDto,
  ) {
    return this.rssService.findAllFeeds(userId, query);
  }

  @Get('feeds/:id')
  async getFeed(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.rssService.findOneFeed(userId, id);
  }

  @Put('feeds/:id')
  async updateFeed(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateFeedDto: UpdateFeedDto,
  ) {
    return this.rssService.updateFeed(userId, id, updateFeedDto);
  }

  @Delete('feeds/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFeed(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.rssService.removeFeed(userId, id);
  }

  @Post('feeds/:id/refresh')
  async refreshFeed(@GetUser('id') userId: string, @Param('id') id: string) {
    const newItemsCount = await this.rssService.refreshFeed(userId, id);
    return {
      message: 'Feed refreshed successfully',
      newItems: newItemsCount,
    };
  }

  @Post('feeds/refresh-all')
  async refreshAllFeeds(@GetUser('id') userId: string) {
    await this.rssService.refreshAllFeeds(userId);
    return { message: 'All feeds refreshed successfully' };
  }

  // ===== Item Management =====

  @Get('items')
  async getAllItems(
    @GetUser('id') userId: string,
    @Query() query: ItemQueryDto,
  ) {
    return this.rssService.findAllItems(userId, query);
  }

  @Get('items/:id')
  async getItem(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.rssService.findOneItem(userId, id);
  }

  @Put('items/:id/read')
  async markAsRead(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body('read') read: boolean,
  ) {
    return this.rssService.markAsRead(userId, id, read);
  }

  @Put('items/:id/star')
  async toggleStar(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.rssService.toggleStar(userId, id);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.rssService.removeItem(userId, id);
  }

  // ===== Map Data =====

  @Get('map-items')
  async getMapItems(
    @GetUser('id') userId: string,
    @Query() query: MapItemsQueryDto,
  ) {
    return this.rssService.getMapItems(userId, query);
  }

  // ===== Statistics =====

  @Get('stats')
  async getStats(@GetUser('id') userId: string) {
    return this.rssService.getStats(userId);
  }

  // ===== Export =====

  @Post('export')
  async exportItems(
    @GetUser('id') userId: string,
    @Body() exportDto: ExportItemsDto,
    @Query() query: ItemQueryDto,
    @Res() res: Response,
  ) {
    // Get items to export
    let items;

    if (exportDto.itemIds && exportDto.itemIds.length > 0) {
      // Export specific items
      items = await Promise.all(
        exportDto.itemIds.map((id) => this.rssService.findOneItem(userId, id))
      );
    } else {
      // Export based on current query
      const result = await this.rssService.findAllItems(userId, {
        ...query,
        limit: 10000, // Max items for export
        offset: 0,
      });
      items = result.items;
    }

    // Generate export data
    const exportData = this.exportService.exportItems(items, {
      format: exportDto.format,
      includeMetadata: exportDto.includeMetadata,
      fields: exportDto.fields,
    });

    // Set response headers
    const mimeType = this.exportService.getMimeType(exportDto.format);
    const extension = this.exportService.getFileExtension(exportDto.format);
    const filename = `rss-export-${new Date().toISOString().split('T')[0]}.${extension}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  }

  // ===== Feed Collections =====

  @Post('collections')
  async createCollection(
    @GetUser('id') userId: string,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.collectionService.createCollection(userId, dto);
  }

  @Get('collections')
  async getAllCollections(@GetUser('id') userId: string) {
    return this.collectionService.findAllCollections(userId);
  }

  @Get('collections/default')
  async getDefaultCollection(@GetUser('id') userId: string) {
    return this.collectionService.findDefaultCollection(userId);
  }

  @Get('collections/:id')
  async getCollection(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.collectionService.findOneCollection(userId, id);
  }

  @Put('collections/:id')
  async updateCollection(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionService.updateCollection(userId, id, dto);
  }

  @Delete('collections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCollection(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.collectionService.deleteCollection(userId, id);
  }

  @Post('collections/:id/feeds')
  async addFeedsToCollection(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddFeedsToCollectionDto,
  ) {
    return this.collectionService.addFeedsToCollection(userId, id, dto);
  }

  @Delete('collections/:id/feeds')
  async removeFeedsFromCollection(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RemoveFeedsFromCollectionDto,
  ) {
    return this.collectionService.removeFeedsFromCollection(userId, id, dto);
  }

  @Get('feeds/:feedId/collections')
  async getCollectionsByFeed(
    @GetUser('id') userId: string,
    @Param('feedId') feedId: string,
  ) {
    return this.collectionService.findCollectionsByFeed(userId, feedId);
  }
}
