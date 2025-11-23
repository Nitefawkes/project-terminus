import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  location: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly cache = new Map<string, GeocodingResult>();

  /**
   * Extract location from text using simple pattern matching
   */
  extractLocation(text: string): string | null {
    if (!text) return null;

    // Common patterns for locations in news
    const patterns = [
      // City, Country
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)\b/g,
      // City
      /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
      // at Location
      /\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/^(in|at)\s+/i, '').trim();
      }
    }

    return null;
  }

  /**
   * Geocode a location string to coordinates using Nominatim
   */
  async geocode(location: string): Promise<GeocodingResult | null> {
    if (!location) return null;

    // Check cache first
    const cached = this.cache.get(location.toLowerCase());
    if (cached) {
      this.logger.debug(`Cache hit for location: ${location}`);
      return cached;
    }

    try {
      this.logger.debug(`Geocoding location: ${location}`);

      const response = await axios.get(this.nominatimUrl, {
        params: {
          q: location,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'ProjectTerminus/1.0',
        },
        timeout: 5000,
      });

      if (response.data && response.data.length > 0) {
        const result: GeocodingResult = {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
          location: response.data[0].display_name,
        };

        // Cache the result
        this.cache.set(location.toLowerCase(), result);

        // Limit cache size to 1000 entries
        if (this.cache.size > 1000) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }

        this.logger.debug(`Geocoded ${location} to ${result.latitude}, ${result.longitude}`);
        return result;
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to geocode ${location}: ${error.message}`);
      return null;
    }
  }

  /**
   * Attempt to geocode an RSS item from title and description
   */
  async geocodeItem(title: string, description: string): Promise<GeocodingResult | null> {
    // Try to extract location from title first
    let location = this.extractLocation(title);

    // If not found, try description
    if (!location && description) {
      location = this.extractLocation(description);
    }

    if (!location) {
      return null;
    }

    return await this.geocode(location);
  }

  /**
   * Clear the geocoding cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Geocoding cache cleared');
  }
}
