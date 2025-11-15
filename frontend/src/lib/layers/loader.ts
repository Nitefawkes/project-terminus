/**
 * Layer SDK - Loader for fetching and transforming layer data
 */

import { LayerManifest, LayerType } from './types';

export class LayerLoader {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Load layer data based on manifest configuration
   */
  async loadLayer(manifest: LayerManifest): Promise<any> {
    // Check cache first
    const cached = this.getCached(manifest.id, manifest.source.ttl);
    if (cached) {
      return cached;
    }

    // Load based on layer type
    let data: any;
    switch (manifest.type) {
      case 'geojson':
        data = await this.loadGeoJSON(manifest.source.url, manifest.source.headers);
        break;
      case 'tiles':
        // Tile layers don't need loading, just pass through the URL
        data = { type: 'tiles', url: manifest.source.url };
        break;
      case 'rss':
        data = await this.loadRSS(manifest.source.url);
        break;
      case 'custom':
        // Custom layers handled by specific components
        data = null;
        break;
      default:
        throw new Error(`Unsupported layer type: ${manifest.type}`);
    }

    // Cache the result
    this.setCache(manifest.id, data);
    return data;
  }

  /**
   * Load GeoJSON data
   */
  private async loadGeoJSON(url: string, headers?: Record<string, string>): Promise<any> {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Validate it's GeoJSON
      if (!data.type || !['FeatureCollection', 'Feature'].includes(data.type)) {
        throw new Error('Invalid GeoJSON format');
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to load GeoJSON from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Load RSS feed (expects RSS-to-GeoJSON transform on server)
   */
  private async loadRSS(url: string): Promise<any> {
    try {
      // In MVP, RSS feeds should be pre-transformed to GeoJSON by backend
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to load RSS from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get cached data if still valid
   */
  private getCached(layerId: string, ttl: number): any | null {
    const cached = this.cache.get(layerId);
    if (!cached) return null;

    const age = (Date.now() - cached.timestamp) / 1000;
    if (age > ttl) {
      this.cache.delete(layerId);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache data
   */
  private setCache(layerId: string, data: any): void {
    this.cache.set(layerId, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for a specific layer or all layers
   */
  clearCache(layerId?: string): void {
    if (layerId) {
      this.cache.delete(layerId);
    } else {
      this.cache.clear();
    }
  }
}

// Singleton instance
export const layerLoader = new LayerLoader();
