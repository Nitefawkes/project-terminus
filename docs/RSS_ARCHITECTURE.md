# RSS Feed Integration - Architecture Design

## Overview

Project Terminus RSS Feed Integration provides real-time intelligence from RSS/Atom feeds displayed both on the map and in a dedicated aggregator page.

---

## Feed Type System

### Primary Categories

1. **NEWS** - General news and media
   - `global` - International news
   - `regional` - Region-specific news
   - `local` - Local news
   - `technology` - Tech news
   - `business` - Business news
   - `politics` - Political news

2. **SECURITY** - Security and intelligence
   - `cybersecurity` - Cyber threats and vulnerabilities
   - `geopolitical` - Geopolitical events
   - `terrorism` - Terrorism alerts
   - `crime` - Crime reports
   - `military` - Military operations
   - `intelligence` - Intelligence reports

3. **DISASTER** - Natural and man-made disasters
   - `earthquake` - Earthquake alerts
   - `weather` - Severe weather
   - `fire` - Wildfire updates
   - `flood` - Flood warnings
   - `humanitarian` - Humanitarian crises

4. **MARITIME** - Maritime and naval
   - `shipping` - Shipping traffic
   - `piracy` - Piracy incidents
   - `naval` - Naval operations
   - `ports` - Port activity

5. **AVIATION** - Aviation and aerospace
   - `flights` - Flight tracking
   - `incidents` - Aviation incidents
   - `space` - Space launches and events

6. **CONFLICT** - Conflict and war
   - `active` - Active conflicts
   - `protests` - Protests and civil unrest
   - `ceasefire` - Peace agreements

7. **ECONOMICS** - Economic indicators
   - `markets` - Market updates
   - `commodities` - Commodity prices
   - `sanctions` - Trade sanctions

8. **SCIENCE** - Scientific discoveries
   - `research` - Research publications
   - `discoveries` - New discoveries
   - `climate` - Climate science

9. **HEALTH** - Health and medical
   - `outbreaks` - Disease outbreaks
   - `alerts` - Health alerts
   - `research` - Medical research

10. **CUSTOM** - User-defined feeds
    - `user_defined` - Custom RSS feeds

---

## Default Feed Sources

### Security & Intelligence
- **US-CERT Alerts**: https://www.us-cert.gov/ncas/alerts.xml
- **FBI Cyber Division**: (Public alerts)
- **ACLED Conflict Data**: https://acleddata.com/data-export-tool/
- **Global Incident Map**: RSS feeds

### News & Media
- **Reuters World**: http://feeds.reuters.com/Reuters/worldNews
- **BBC News**: http://feeds.bbci.co.uk/news/world/rss.xml
- **Al Jazeera**: https://www.aljazeera.com/xml/rss/all.xml
- **AP News**: https://apnews.com/apf-topnews

### Disaster & Emergency
- **USGS Earthquakes**: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom
- **GDACS (Disasters)**: https://www.gdacs.org/xml/rss.xml
- **ReliefWeb**: https://reliefweb.int/updates/rss.xml

### Maritime
- **Maritime Executive**: https://maritime-executive.com/rss
- **gCaptain**: https://gcaptain.com/feed/

### Aviation
- **Aviation Herald**: https://avherald.com/rss/

---

## Data Model

### RSSFeed Entity
```typescript
{
  id: UUID
  url: string                    // Feed URL
  name: string                   // Display name
  type: FeedType                 // Primary category
  subtype: string                // Subtype
  enabled: boolean               // Active/inactive
  refreshInterval: number        // Minutes
  geocodingEnabled: boolean      // Auto-geocode
  lastFetched: Date
  lastError: string | null
  createdAt: Date
  updatedAt: Date
}
```

### RSSItem Entity
```typescript
{
  id: UUID
  feedId: UUID                   // Parent feed
  title: string
  description: string
  link: string
  pubDate: Date
  guid: string                   // Unique identifier
  author: string | null

  // Geolocation
  latitude: number | null
  longitude: number | null
  location: string | null        // Parsed location
  geocoded: boolean

  // Metadata
  categories: string[]
  enclosures: Enclosure[]        // Images, videos

  // Display
  read: boolean
  starred: boolean

  createdAt: Date
}
```

### UserFeedPreference Entity
```typescript
{
  id: UUID
  userId: UUID
  feedId: UUID
  enabled: boolean
  showOnMap: boolean
  markerColor: string
  createdAt: Date
}
```

---

## Backend Architecture

### RSS Module Structure
```
backend/src/modules/rss/
├── entities/
│   ├── rss-feed.entity.ts
│   ├── rss-item.entity.ts
│   └── user-feed-preference.entity.ts
├── dto/
│   ├── create-feed.dto.ts
│   ├── update-feed.dto.ts
│   ├── feed-item.dto.ts
│   └── feed-query.dto.ts
├── services/
│   ├── rss-parser.service.ts      // Parse RSS/Atom
│   ├── geocoding.service.ts       // Extract locations
│   ├── rss-fetcher.service.ts     // Fetch & process feeds
│   └── rss.service.ts             // Main service
├── rss.controller.ts
├── rss.module.ts
└── rss.scheduler.ts               // Cron jobs
```

### Key Services

#### RSSParserService
- Parse RSS 2.0, Atom feeds
- Extract metadata
- Normalize to common format

#### GeocodingService
- Extract locations from text (NER)
- Geocode using Nominatim/Google Maps
- Cache geocoding results

#### RSSFetcherService
- Fetch feed URLs
- Parse with RSS parser
- Geocode items
- Store in database
- Handle errors gracefully

---

## API Endpoints

### Feed Management
```
GET    /api/rss/feeds              - List all feeds
GET    /api/rss/feeds/:id          - Get feed details
POST   /api/rss/feeds              - Create new feed
PUT    /api/rss/feeds/:id          - Update feed
DELETE /api/rss/feeds/:id          - Delete feed
POST   /api/rss/feeds/:id/refresh  - Manual refresh
```

### Feed Items
```
GET    /api/rss/items              - Get all items (paginated, filtered)
GET    /api/rss/items/:id          - Get item details
PUT    /api/rss/items/:id/read     - Mark as read
PUT    /api/rss/items/:id/star     - Star/unstar item
DELETE /api/rss/items/:id          - Delete item
```

### User Preferences
```
GET    /api/rss/preferences        - Get user's feed preferences
PUT    /api/rss/preferences/:feedId - Update preferences
```

### Map Data
```
GET    /api/rss/map-items          - Get geocoded items for map
  Query params:
    - types: FeedType[]
    - subtypes: string[]
    - since: Date
    - bounds: MapBounds
```

---

## Frontend Architecture

### Components

#### Feed Management
```
frontend/src/components/RSS/
├── FeedList.tsx               - List of available feeds
├── FeedItem.tsx               - Single feed display
├── FeedManager.tsx            - Add/edit/delete feeds
├── FeedCategoryFilter.tsx     - Filter by type/subtype
└── FeedSettings.tsx           - Feed configuration
```

#### Map Integration
```
frontend/src/components/Map/
├── RSSLayer.tsx               - Map layer for RSS items
├── RSSMarker.tsx              - Individual item marker
└── RSSPopup.tsx               - Item details popup
```

#### Aggregator Page
```
frontend/src/app/feeds/
├── page.tsx                   - Main feeds page
└── [id]/page.tsx              - Single feed view

frontend/src/components/Feeds/
├── FeedAggregator.tsx         - Feed aggregation view
├── FeedItemCard.tsx           - Item display card
├── FeedTimeline.tsx           - Timeline view
└── FeedFilters.tsx            - Advanced filtering
```

### State Management
```typescript
// Zustand store for RSS feeds
interface RSSStore {
  feeds: RSSFeed[]
  items: RSSItem[]
  selectedTypes: FeedType[]
  selectedSubtypes: string[]
  showOnMap: boolean
  loading: boolean

  // Actions
  fetchFeeds: () => Promise<void>
  fetchItems: (filters) => Promise<void>
  toggleFeed: (feedId) => void
  markAsRead: (itemId) => void
  toggleStar: (itemId) => void
}
```

---

## Geocoding Strategy

### Location Extraction
1. **Explicit GeoRSS Tags**
   - `georss:point`
   - `geo:lat`, `geo:long`
   - Parse and use directly

2. **Named Entity Recognition**
   - Extract location names from title/description
   - Use NLP library (compromise.js or similar)
   - Extract: cities, countries, landmarks

3. **Geocoding APIs**
   - Primary: Nominatim (free, OpenStreetMap)
   - Fallback: Google Maps Geocoding (with API key)
   - Cache results to reduce API calls

4. **Manual Locations**
   - Allow users to set location manually
   - Override automatic geocoding

### Caching
- Cache geocoded locations in database
- TTL: 30 days
- Reduce API calls by 90%+

---

## Refresh Strategy

### Scheduled Refresh
- Default: Every 15 minutes
- Configurable per feed
- Stagger requests to avoid rate limits

### Manual Refresh
- User can trigger immediate refresh
- Rate limit: 1 per minute per feed

### Error Handling
- Exponential backoff on failures
- Disable feed after 5 consecutive failures
- Alert admin of persistent errors

---

## Map Visualization

### Markers
- **Color by Type**
  - NEWS: Blue
  - SECURITY: Red
  - DISASTER: Orange
  - MARITIME: Teal
  - AVIATION: Purple
  - CONFLICT: Dark Red
  - ECONOMICS: Green
  - SCIENCE: Cyan
  - HEALTH: Pink
  - CUSTOM: Gray

- **Icon by Subtype**
  - Distinct icons for each subtype
  - Use Lucide React icons

### Clustering
- Group nearby items
- Show count in cluster
- Expand on click

### Popup Content
- Title
- Description (truncated)
- Source feed
- Publication date
- Link to full article
- Mark as read/star buttons

---

## Aggregator Page Features

### Views
1. **Timeline View** - Chronological list
2. **Grid View** - Card-based grid
3. **Map View** - Full-screen map with feeds

### Filters
- By feed type
- By subtype
- By date range
- By read/unread
- By starred
- By keyword search

### Actions
- Mark all as read
- Star/unstar items
- Share item
- Open in new tab
- Delete item

---

## Security Considerations

1. **Feed Validation**
   - Validate feed URLs before adding
   - Sanitize HTML content
   - Prevent XSS attacks

2. **Rate Limiting**
   - Limit feed additions per user
   - Rate limit refresh requests

3. **Authentication**
   - All endpoints require JWT auth
   - User can only manage own feeds (except admin)

4. **Content Filtering**
   - Option to filter inappropriate content
   - Blacklist certain domains

---

## Performance Optimization

1. **Caching**
   - Cache parsed feeds for 5 minutes
   - Cache geocoding results for 30 days
   - Use Redis for feed cache

2. **Pagination**
   - Default page size: 50 items
   - Infinite scroll on aggregator page

3. **Lazy Loading**
   - Load map markers only in viewport
   - Load images on demand

4. **Database Indexing**
   - Index on feedId, pubDate, geocoded
   - Full-text search on title/description

---

## Future Enhancements

1. **AI-Powered Features**
   - Auto-categorization with ML
   - Sentiment analysis
   - Event deduplication

2. **Advanced Visualization**
   - Heat maps for event density
   - Temporal animation (replay events)
   - Network graphs for connections

3. **Collaboration**
   - Share feeds with team
   - Annotate items
   - Create custom dashboards

4. **Integrations**
   - Export to Slack/Discord
   - IFTTT integration
   - Zapier support

---

## Implementation Priority

### Phase 1 (Week 1) - MVP
- [ ] Backend RSS module
- [ ] Feed CRUD operations
- [ ] Basic RSS parser
- [ ] Database schema
- [ ] Simple geocoding

### Phase 2 (Week 2) - Frontend
- [ ] Feed management UI
- [ ] Aggregator page
- [ ] Map layer for RSS items
- [ ] Basic filtering

### Phase 3 (Week 3) - Enhancement
- [ ] Advanced geocoding
- [ ] Scheduled refresh
- [ ] User preferences
- [ ] Polish UI/UX

---

**Architecture Version:** 1.0
**Last Updated:** November 22, 2025
**Status:** Design Complete ✅
