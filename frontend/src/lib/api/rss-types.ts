// RSS Feed Types and Interfaces

export enum FeedType {
  NEWS = 'news',
  SECURITY = 'security',
  DISASTER = 'disaster',
  MARITIME = 'maritime',
  AVIATION = 'aviation',
  CONFLICT = 'conflict',
  ECONOMICS = 'economics',
  SCIENCE = 'science',
  HEALTH = 'health',
  CUSTOM = 'custom',
}

export interface RSSFeed {
  id: string;
  url: string;
  name: string;
  type: FeedType;
  subtype: string;
  enabled: boolean;
  refreshInterval: number;
  geocodingEnabled: boolean;
  lastFetched: string | null;
  lastError: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RSSItem {
  id: string;
  feedId: string;
  title: string;
  description: string | null;
  link: string;
  pubDate: string;
  guid: string;
  author: string | null;
  latitude: number | null;
  longitude: number | null;
  location: string | null;
  geocoded: boolean;
  categories: string[];
  imageUrl: string | null;
  contentSnippet: string | null;
  read: boolean;
  starred: boolean;
  createdAt: string;
  feed?: RSSFeed;
}

export interface CreateFeedRequest {
  url: string;
  name: string;
  type: FeedType;
  subtype: string;
  enabled?: boolean;
  refreshInterval?: number;
  geocodingEnabled?: boolean;
}

export interface UpdateFeedRequest {
  url?: string;
  name?: string;
  type?: FeedType;
  subtype?: string;
  enabled?: boolean;
  refreshInterval?: number;
  geocodingEnabled?: boolean;
}

export interface FeedQuery {
  type?: FeedType;
  subtype?: string;
  enabled?: boolean;
}

export interface ItemQuery {
  feedIds?: string[];
  types?: FeedType[];
  subtypes?: string[];
  geocoded?: boolean;
  read?: boolean;
  starred?: boolean;
  since?: string;
  until?: string;
  search?: string;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapItemsQuery extends ItemQuery {
  bounds?: MapBounds;
}

export interface ItemsResponse {
  items: RSSItem[];
  total: number;
}

// Feed type configuration with display metadata
export interface FeedTypeConfig {
  type: FeedType;
  label: string;
  description: string;
  icon: string;
  color: string;
  subtypes: {
    value: string;
    label: string;
  }[];
}

// Default feed sources
export interface DefaultFeedSource {
  name: string;
  url: string;
  type: FeedType;
  subtype: string;
  description: string;
}

// Feed Collections
export interface FeedCollection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  sortOrder: number;
  feeds: RSSFeed[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  sortOrder?: number;
  feedIds?: string[];
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface AddFeedsToCollectionRequest {
  feedIds: string[];
}

export interface RemoveFeedsFromCollectionRequest {
  feedIds: string[];
}

// Export
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
}

export interface ExportRequest {
  format: ExportFormat;
  includeMetadata?: boolean;
  fields?: string[];
  itemIds?: string[];
}

// Saved Searches
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  filters: ItemQuery;
  isDefault: boolean;
  isPinned: boolean;
  sortOrder: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchRequest {
  name: string;
  description?: string;
  filters: ItemQuery;
  isDefault?: boolean;
  isPinned?: boolean;
  sortOrder?: number;
}

export interface UpdateSavedSearchRequest {
  name?: string;
  description?: string;
  filters?: ItemQuery;
  isDefault?: boolean;
  isPinned?: boolean;
  sortOrder?: number;
}
