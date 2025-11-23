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
} from '@nestjs/common';
import { RSSService } from './services/rss.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { FeedQueryDto, ItemQueryDto, MapItemsQueryDto } from './dto/feed-query.dto';

@Controller('rss')
@UseGuards(JwtAuthGuard)
export class RSSController {
  constructor(private readonly rssService: RSSService) {}

  // ===== Feed Management =====

  @Post('feeds')
  async createFeed(@Body() createFeedDto: CreateFeedDto) {
    return this.rssService.createFeed(createFeedDto);
  }

  @Get('feeds')
  async getAllFeeds(@Query() query: FeedQueryDto) {
    return this.rssService.findAllFeeds(query);
  }

  @Get('feeds/:id')
  async getFeed(@Param('id') id: string) {
    return this.rssService.findOneFeed(id);
  }

  @Put('feeds/:id')
  async updateFeed(@Param('id') id: string, @Body() updateFeedDto: UpdateFeedDto) {
    return this.rssService.updateFeed(id, updateFeedDto);
  }

  @Delete('feeds/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFeed(@Param('id') id: string) {
    await this.rssService.removeFeed(id);
  }

  @Post('feeds/:id/refresh')
  async refreshFeed(@Param('id') id: string) {
    const newItemsCount = await this.rssService.refreshFeed(id);
    return {
      message: 'Feed refreshed successfully',
      newItems: newItemsCount,
    };
  }

  @Post('feeds/refresh-all')
  async refreshAllFeeds() {
    await this.rssService.refreshAllFeeds();
    return { message: 'All feeds refreshed successfully' };
  }

  // ===== Item Management =====

  @Get('items')
  async getAllItems(@Query() query: ItemQueryDto) {
    return this.rssService.findAllItems(query);
  }

  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    return this.rssService.findOneItem(id);
  }

  @Put('items/:id/read')
  async markAsRead(@Param('id') id: string, @Body('read') read: boolean) {
    return this.rssService.markAsRead(id, read);
  }

  @Put('items/:id/star')
  async toggleStar(@Param('id') id: string) {
    return this.rssService.toggleStar(id);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Param('id') id: string) {
    await this.rssService.removeItem(id);
  }

  // ===== Map Data =====

  @Get('map-items')
  async getMapItems(@Query() query: MapItemsQueryDto) {
    return this.rssService.getMapItems(query);
  }

  // ===== Statistics =====

  @Get('stats')
  async getStats() {
    // TODO: Implement stats aggregation
    return {
      totalFeeds: 0,
      totalItems: 0,
      geocodedItems: 0,
      unreadItems: 0,
    };
  }
}
