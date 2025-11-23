import { Injectable } from '@nestjs/common';
import { RSSItem } from '../entities/rss-item.entity';

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
}

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  fields?: string[];
}

@Injectable()
export class ExportService {
  /**
   * Export items to the specified format
   */
  exportItems(items: RSSItem[], options: ExportOptions): string {
    switch (options.format) {
      case ExportFormat.JSON:
        return this.exportToJSON(items, options);
      case ExportFormat.CSV:
        return this.exportToCSV(items, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export items to JSON format
   */
  private exportToJSON(items: RSSItem[], options: ExportOptions): string {
    const data = items.map((item) => this.mapItemForExport(item, options));

    const exportData = {
      ...(options.includeMetadata && {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalItems: items.length,
          format: 'json',
        },
      }),
      items: data,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export items to CSV format
   */
  private exportToCSV(items: RSSItem[], options: ExportOptions): string {
    if (items.length === 0) {
      return '';
    }

    // Define fields for CSV
    const defaultFields = [
      'title',
      'link',
      'pubDate',
      'author',
      'feedName',
      'feedType',
      'location',
      'latitude',
      'longitude',
      'read',
      'starred',
      'categories',
    ];

    const fields = options.fields || defaultFields;

    // Create CSV header
    const header = fields.join(',');

    // Create CSV rows
    const rows = items.map((item) => {
      return fields
        .map((field) => {
          let value = this.getFieldValue(item, field);

          // Handle special cases
          if (value === null || value === undefined) {
            return '';
          }

          // Convert arrays to semicolon-separated string
          if (Array.isArray(value)) {
            value = value.join(';');
          }

          // Convert dates to ISO string
          if (value instanceof Date) {
            value = value.toISOString();
          }

          // Escape and quote value
          value = String(value);
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Get field value from item, including nested fields
   */
  private getFieldValue(item: RSSItem, field: string): any {
    switch (field) {
      case 'feedName':
        return item.feed?.name;
      case 'feedType':
        return item.feed?.type;
      case 'feedSubtype':
        return item.feed?.subtype;
      default:
        return item[field as keyof RSSItem];
    }
  }

  /**
   * Map item to export format with selected fields
   */
  private mapItemForExport(item: RSSItem, options: ExportOptions): any {
    const baseData = {
      id: item.id,
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      author: item.author,
      categories: item.categories,
      imageUrl: item.imageUrl,
      read: item.read,
      starred: item.starred,
    };

    // Add location data if geocoded
    if (item.geocoded) {
      Object.assign(baseData, {
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
      });
    }

    // Add feed information if available
    if (item.feed) {
      Object.assign(baseData, {
        feed: {
          id: item.feed.id,
          name: item.feed.name,
          type: item.feed.type,
          subtype: item.feed.subtype,
        },
      });
    }

    // Filter fields if specified
    if (options.fields && options.fields.length > 0) {
      const filteredData: any = {};
      options.fields.forEach((field) => {
        if (field in baseData) {
          filteredData[field] = baseData[field as keyof typeof baseData];
        }
      });
      return filteredData;
    }

    return baseData;
  }

  /**
   * Get MIME type for export format
   */
  getMimeType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.JSON:
        return 'application/json';
      case ExportFormat.CSV:
        return 'text/csv';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get file extension for export format
   */
  getFileExtension(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.JSON:
        return 'json';
      case ExportFormat.CSV:
        return 'csv';
      default:
        return 'txt';
    }
  }
}
