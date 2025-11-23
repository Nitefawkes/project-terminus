import { FeedType, FeedTypeConfig, DefaultFeedSource } from '@/lib/api/rss-types';

/**
 * Feed type configurations with display metadata
 */
export const FEED_TYPE_CONFIGS: Record<FeedType, FeedTypeConfig> = {
  [FeedType.NEWS]: {
    type: FeedType.NEWS,
    label: 'News',
    description: 'General news and media coverage',
    icon: 'Newspaper',
    color: '#3B82F6', // Blue
    subtypes: [
      { value: 'global', label: 'Global News' },
      { value: 'regional', label: 'Regional News' },
      { value: 'local', label: 'Local News' },
      { value: 'technology', label: 'Technology' },
      { value: 'business', label: 'Business' },
      { value: 'politics', label: 'Politics' },
    ],
  },
  [FeedType.SECURITY]: {
    type: FeedType.SECURITY,
    label: 'Security',
    description: 'Security and intelligence reports',
    icon: 'Shield',
    color: '#EF4444', // Red
    subtypes: [
      { value: 'cybersecurity', label: 'Cybersecurity' },
      { value: 'geopolitical', label: 'Geopolitical' },
      { value: 'terrorism', label: 'Terrorism' },
      { value: 'crime', label: 'Crime' },
      { value: 'military', label: 'Military' },
      { value: 'intelligence', label: 'Intelligence' },
    ],
  },
  [FeedType.DISASTER]: {
    type: FeedType.DISASTER,
    label: 'Disaster',
    description: 'Natural and man-made disasters',
    icon: 'AlertTriangle',
    color: '#F97316', // Orange
    subtypes: [
      { value: 'earthquake', label: 'Earthquakes' },
      { value: 'weather', label: 'Severe Weather' },
      { value: 'fire', label: 'Wildfires' },
      { value: 'flood', label: 'Floods' },
      { value: 'humanitarian', label: 'Humanitarian Crises' },
    ],
  },
  [FeedType.MARITIME]: {
    type: FeedType.MARITIME,
    label: 'Maritime',
    description: 'Maritime and naval activities',
    icon: 'Anchor',
    color: '#14B8A6', // Teal
    subtypes: [
      { value: 'shipping', label: 'Shipping' },
      { value: 'piracy', label: 'Piracy' },
      { value: 'naval', label: 'Naval Operations' },
      { value: 'ports', label: 'Port Activity' },
    ],
  },
  [FeedType.AVIATION]: {
    type: FeedType.AVIATION,
    label: 'Aviation',
    description: 'Aviation and aerospace events',
    icon: 'Plane',
    color: '#8B5CF6', // Purple
    subtypes: [
      { value: 'flights', label: 'Flight Tracking' },
      { value: 'incidents', label: 'Aviation Incidents' },
      { value: 'space', label: 'Space Events' },
    ],
  },
  [FeedType.CONFLICT]: {
    type: FeedType.CONFLICT,
    label: 'Conflict',
    description: 'Conflicts and civil unrest',
    icon: 'Swords',
    color: '#DC2626', // Dark Red
    subtypes: [
      { value: 'active', label: 'Active Conflicts' },
      { value: 'protests', label: 'Protests & Unrest' },
      { value: 'ceasefire', label: 'Peace Agreements' },
    ],
  },
  [FeedType.ECONOMICS]: {
    type: FeedType.ECONOMICS,
    label: 'Economics',
    description: 'Economic indicators and markets',
    icon: 'TrendingUp',
    color: '#10B981', // Green
    subtypes: [
      { value: 'markets', label: 'Market Updates' },
      { value: 'commodities', label: 'Commodities' },
      { value: 'sanctions', label: 'Trade Sanctions' },
    ],
  },
  [FeedType.SCIENCE]: {
    type: FeedType.SCIENCE,
    label: 'Science',
    description: 'Scientific discoveries and research',
    icon: 'Microscope',
    color: '#06B6D4', // Cyan
    subtypes: [
      { value: 'research', label: 'Research' },
      { value: 'discoveries', label: 'Discoveries' },
      { value: 'climate', label: 'Climate Science' },
    ],
  },
  [FeedType.HEALTH]: {
    type: FeedType.HEALTH,
    label: 'Health',
    description: 'Health alerts and medical news',
    icon: 'Heart',
    color: '#EC4899', // Pink
    subtypes: [
      { value: 'outbreaks', label: 'Disease Outbreaks' },
      { value: 'alerts', label: 'Health Alerts' },
      { value: 'research', label: 'Medical Research' },
    ],
  },
  [FeedType.CUSTOM]: {
    type: FeedType.CUSTOM,
    label: 'Custom',
    description: 'User-defined feeds',
    icon: 'Settings',
    color: '#6B7280', // Gray
    subtypes: [
      { value: 'user_defined', label: 'User Defined' },
    ],
  },
};

/**
 * Get feed type configuration
 */
export function getFeedTypeConfig(type: FeedType): FeedTypeConfig {
  return FEED_TYPE_CONFIGS[type] || FEED_TYPE_CONFIGS[FeedType.CUSTOM];
}

/**
 * Get color for feed type
 */
export function getFeedTypeColor(type: FeedType): string {
  return getFeedTypeConfig(type).color;
}

/**
 * Default feed sources - curated list of high-quality feeds
 */
export const DEFAULT_FEED_SOURCES: DefaultFeedSource[] = [
  // News
  {
    name: 'Reuters World News',
    url: 'http://feeds.reuters.com/Reuters/worldNews',
    type: FeedType.NEWS,
    subtype: 'global',
    description: 'International news from Reuters',
  },
  {
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    type: FeedType.NEWS,
    subtype: 'global',
    description: 'Global news coverage from BBC',
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    type: FeedType.NEWS,
    subtype: 'global',
    description: 'News from Al Jazeera',
  },
  {
    name: 'AP News',
    url: 'https://apnews.com/apf-topnews',
    type: FeedType.NEWS,
    subtype: 'global',
    description: 'Top news from Associated Press',
  },

  // Disasters
  {
    name: 'USGS Earthquakes (All)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom',
    type: FeedType.DISASTER,
    subtype: 'earthquake',
    description: 'All earthquakes in the last 24 hours',
  },
  {
    name: 'USGS Earthquakes (M4.5+)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.atom',
    type: FeedType.DISASTER,
    subtype: 'earthquake',
    description: 'Magnitude 4.5+ earthquakes in last 24 hours',
  },
  {
    name: 'GDACS Global Disasters',
    url: 'https://www.gdacs.org/xml/rss.xml',
    type: FeedType.DISASTER,
    subtype: 'humanitarian',
    description: 'Global Disaster Alert and Coordination System',
  },
  {
    name: 'ReliefWeb Updates',
    url: 'https://reliefweb.int/updates/rss.xml',
    type: FeedType.DISASTER,
    subtype: 'humanitarian',
    description: 'Humanitarian updates from ReliefWeb',
  },

  // Security
  {
    name: 'US-CERT Alerts',
    url: 'https://www.cisa.gov/uscert/ncas/alerts.xml',
    type: FeedType.SECURITY,
    subtype: 'cybersecurity',
    description: 'Cybersecurity alerts from US-CERT',
  },

  // Maritime
  {
    name: 'Maritime Executive',
    url: 'https://maritime-executive.com/rss',
    type: FeedType.MARITIME,
    subtype: 'shipping',
    description: 'Maritime industry news',
  },
  {
    name: 'gCaptain',
    url: 'https://gcaptain.com/feed/',
    type: FeedType.MARITIME,
    subtype: 'shipping',
    description: 'Maritime and offshore news',
  },

  // Aviation
  {
    name: 'Aviation Herald',
    url: 'https://avherald.com/rss/',
    type: FeedType.AVIATION,
    subtype: 'incidents',
    description: 'Aviation incident reports',
  },

  // Science
  {
    name: 'NASA Breaking News',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    type: FeedType.SCIENCE,
    subtype: 'discoveries',
    description: 'Latest news from NASA',
  },
  {
    name: 'Science Daily',
    url: 'https://www.sciencedaily.com/rss/all.xml',
    type: FeedType.SCIENCE,
    subtype: 'research',
    description: 'Latest science news and research',
  },

  // Health
  {
    name: 'WHO Disease Outbreaks',
    url: 'https://www.who.int/feeds/entity/csr/don/en/rss.xml',
    type: FeedType.HEALTH,
    subtype: 'outbreaks',
    description: 'Disease outbreak news from WHO',
  },
];

/**
 * Get default feeds by type
 */
export function getDefaultFeedsByType(type: FeedType): DefaultFeedSource[] {
  return DEFAULT_FEED_SOURCES.filter((feed) => feed.type === type);
}

/**
 * Get all feed types as array
 */
export function getAllFeedTypes(): FeedType[] {
  return Object.values(FeedType);
}

/**
 * Get feed type label
 */
export function getFeedTypeLabel(type: FeedType): string {
  return getFeedTypeConfig(type).label;
}
