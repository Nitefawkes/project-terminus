/**
 * Layer SDK - Type definitions for extensible map layers
 * This allows easy addition of new data overlays without core changes
 */

export type LayerType = 'tiles' | 'geojson' | 'rss' | 'custom';
export type LayerRenderer = 'heatmap' | 'circles' | 'line' | 'raster' | 'fill' | 'symbol';

export interface LayerSource {
  url: string;
  method?: 'GET' | 'POST';
  ttl: number; // Cache TTL in seconds
  headers?: Record<string, string>;
  transform?: string; // Optional transform function name
}

export interface LayerStyle {
  renderer: LayerRenderer;
  paint?: Record<string, any>; // MapLibre paint properties
  layout?: Record<string, any>; // MapLibre layout properties
}

export interface LayerMeta {
  attribution: string;
  license: string;
  description: string;
  updateFrequency?: string; // Human-readable update frequency
  privacy?: 'public' | 'restricted' | 'private';
}

export interface LayerManifest {
  id: string;
  name: string;
  type: LayerType;
  enabled: boolean;
  source: LayerSource;
  style: LayerStyle;
  meta: LayerMeta;
  category?: 'space' | 'weather' | 'events' | 'infrastructure' | 'custom';
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Layer state for runtime management
 */
export interface LayerState {
  id: string;
  visible: boolean;
  loading: boolean;
  error?: string;
  lastUpdate?: Date;
  data?: any; // GeoJSON or tile data
}

/**
 * Layer configuration for built-in layers
 */
export const BUILTIN_LAYERS: Record<string, Omit<LayerManifest, 'id'>> = {
  terminator: {
    name: 'Day/Night Terminator',
    type: 'custom',
    enabled: true,
    source: {
      url: '', // Calculated client-side
      ttl: 60,
    },
    style: {
      renderer: 'line',
      paint: {
        'line-color': '#FFD700',
        'line-width': 3,
        'line-opacity': 0.8,
      },
    },
    meta: {
      attribution: 'Calculated using SunCalc',
      license: 'MIT',
      description: 'Real-time day/night boundary',
      updateFrequency: 'Every 60 seconds',
      privacy: 'public',
    },
    category: 'space',
  },
  timezones: {
    name: 'Time Zone Boundaries',
    type: 'geojson',
    enabled: false,
    source: {
      url: '/data/timezones.geojson',
      ttl: 3600 * 24, // 24 hours
    },
    style: {
      renderer: 'line',
      paint: {
        'line-color': '#888888',
        'line-width': 1,
        'line-opacity': 0.5,
        'line-dasharray': [2, 2],
      },
    },
    meta: {
      attribution: 'Natural Earth Data',
      license: 'Public Domain',
      description: 'World time zone boundaries',
      privacy: 'public',
    },
    category: 'infrastructure',
  },
};
