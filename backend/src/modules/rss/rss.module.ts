import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RSSController } from './rss.controller';
import { RSSService } from './services/rss.service';
import { RSSParserService } from './services/rss-parser.service';
import { GeocodingService } from './services/geocoding.service';
import { CollectionService } from './services/collection.service';
import { RSSScheduler } from './rss.scheduler';
import { RSSFeed } from './entities/rss-feed.entity';
import { RSSItem } from './entities/rss-item.entity';
import { FeedCollection } from './entities/feed-collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RSSFeed, RSSItem, FeedCollection])],
  controllers: [RSSController],
  providers: [
    RSSService,
    RSSParserService,
    GeocodingService,
    CollectionService,
    RSSScheduler,
  ],
  exports: [RSSService, CollectionService],
})
export class RSSModule {}
