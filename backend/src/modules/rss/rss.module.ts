import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RSSController } from './rss.controller';
import { RSSService } from './services/rss.service';
import { RSSParserService } from './services/rss-parser.service';
import { GeocodingService } from './services/geocoding.service';
import { RSSScheduler } from './rss.scheduler';
import { RSSFeed } from './entities/rss-feed.entity';
import { RSSItem } from './entities/rss-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RSSFeed, RSSItem])],
  controllers: [RSSController],
  providers: [RSSService, RSSParserService, GeocodingService, RSSScheduler],
  exports: [RSSService],
})
export class RSSModule {}
