import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RSSService } from './services/rss.service';

@Injectable()
export class RSSScheduler {
  private readonly logger = new Logger(RSSScheduler.name);

  constructor(private readonly rssService: RSSService) {}

  /**
   * Refresh all feeds every 15 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleFeedRefresh() {
    this.logger.log('Starting scheduled feed refresh...');

    try {
      await this.rssService.refreshAllFeeds();
      this.logger.log('Scheduled feed refresh completed');
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
