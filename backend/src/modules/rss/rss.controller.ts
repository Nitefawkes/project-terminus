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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { FeedQueryDto, ItemQueryDto, MapItemsQueryDto } from './dto/feed-query.dto';

@Controller('rss')
@UseGuards(JwtAuthGuard)
export class RSSController {
  constructor(private readonly rssService: RSSService) {}

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
}
