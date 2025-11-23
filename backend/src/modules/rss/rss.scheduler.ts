import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RSSService } from './services/rss.service';
import { RSSFeed } from './entities/rss-feed.entity';

@Injectable()
export class RSSScheduler {
  private readonly logger = new Logger(RSSScheduler.name);

  constructor(
    private readonly rssService: RSSService,
    @InjectRepository(RSSFeed)
    private readonly feedsRepository: Repository<RSSFeed>,
  ) {}

  /**
   * Refresh all feeds every 10 minutes
   * Iterates through all enabled feeds and refreshes them with their user context
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleFeedRefresh() {
    this.logger.log('Starting scheduled feed refresh...');

    try {
      // Get all enabled feeds with their user context
      const feeds = await this.feedsRepository.find({
        where: { enabled: true },
        select: ['id', 'userId', 'name'],
      });

      this.logger.log(`Refreshing ${feeds.length} enabled feeds...`);

      let successCount = 0;
      let errorCount = 0;

      // Refresh each feed individually with user context
      for (const feed of feeds) {
        try {
          await this.rssService.refreshFeed(feed.userId, feed.id);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Error refreshing feed "${feed.name}" (${feed.id}): ${error.message}`,
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Scheduled feed refresh completed: ${successCount} successful, ${errorCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Scheduled feed refresh failed: ${error.message}`);
    }
  }

  /**
   * Optional: Clear geocoding cache daily to free memory
   */
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async handleCacheClear() {
  //   this.logger.log('Clearing geocoding cache...');
  //   // Implement if needed
  // }
}
