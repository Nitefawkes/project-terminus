import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import axios from 'axios';

export interface ParsedFeedItem {
  title: string;
  description?: string;
  link: string;
  pubDate: Date;
  guid: string;
  author?: string;
  categories?: string[];
  imageUrl?: string;
  contentSnippet?: string;

  // GeoRSS tags if present
  geoLat?: number;
  geoLong?: number;
}

export interface ParsedFeed {
  title: string;
  description?: string;
  link?: string;
  items: ParsedFeedItem[];
}

@Injectable()
export class RSSParserService {
  private readonly logger = new Logger(RSSParserService.name);
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['georss:point', 'geoPoint'],
          ['geo:lat', 'geoLat'],
          ['geo:long', 'geoLong'],
          ['media:thumbnail', 'thumbnail'],
          ['media:content', 'mediaContent'],
          ['content:encoded', 'contentEncoded'],
        ],
      },
      timeout: 10000,
    });
  }

  /**
   * Parse an RSS/Atom feed from a URL
   */
  async parseFeed(url: string): Promise<ParsedFeed> {
    try {
      this.logger.debug(`Fetching feed: ${url}`);

      // Fetch the feed with custom user agent
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'ProjectTerminus/1.0 (RSS Reader)',
        },
        timeout: 10000,
        maxRedirects: 5,
      });

      const feedData = response.data;

      // Parse the feed
      const feed = await this.parser.parseString(feedData);

      // Extract items
      const items: ParsedFeedItem[] = feed.items.map((item) => {
        const parsedItem: ParsedFeedItem = {
          title: item.title || 'Untitled',
          description: item.content || item.contentSnippet || item.description,
          link: item.link || '#',
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          guid: item.guid || item.link || `${item.title}-${Date.now()}`,
          author: item.creator || item.author,
          categories: item.categories || [],
          contentSnippet: item.contentSnippet,
        };

        // Extract image
        if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
          parsedItem.imageUrl = item.enclosure.url;
        } else if (item['media:thumbnail']?.['$']?.url) {
          parsedItem.imageUrl = item['media:thumbnail']['$'].url;
        } else if (item.thumbnail?.url) {
          parsedItem.imageUrl = item.thumbnail.url;
        }

        // Extract GeoRSS coordinates if present
        if (item.geoPoint) {
          const coords = item.geoPoint.trim().split(/\s+/);
          if (coords.length === 2) {
            parsedItem.geoLat = parseFloat(coords[0]);
            parsedItem.geoLong = parseFloat(coords[1]);
          }
        } else if (item.geoLat && item.geoLong) {
          parsedItem.geoLat = parseFloat(item.geoLat);
          parsedItem.geoLong = parseFloat(item.geoLong);
        }

        return parsedItem;
      });

      return {
        title: feed.title || 'Unknown Feed',
        description: feed.description,
        link: feed.link,
        items,
      };
    } catch (error) {
      this.logger.error(`Failed to parse feed ${url}: ${error.message}`);
      throw new Error(`Failed to fetch or parse feed: ${error.message}`);
    }
  }

  /**
   * Validate if a URL is a valid RSS/Atom feed
   */
  async validateFeedUrl(url: string): Promise<boolean> {
    try {
      await this.parseFeed(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}
