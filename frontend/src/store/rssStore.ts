import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';
import {
  RSSFeed,
  RSSItem,
  FeedType,
  ItemQuery,
  MapItemsQuery,
  CreateFeedRequest,
  UpdateFeedRequest,
} from '@/lib/api/rss-types';

interface RSSStore {
  // State
  feeds: RSSFeed[];
  items: RSSItem[];
  mapItems: RSSItem[];
  selectedFeed: RSSFeed | null;
  selectedItem: RSSItem | null;

  // Filters
  selectedTypes: FeedType[];
  selectedSubtypes: string[];
  showOnMap: boolean;
  showUnreadOnly: boolean;
  showStarredOnly: boolean;
  searchQuery: string;

  // UI State
  loading: boolean;
  error: string | null;
  refreshing: boolean;

  // Actions - Feeds
  fetchFeeds: () => Promise<void>;
  fetchFeed: (id: string) => Promise<void>;
  createFeed: (data: CreateFeedRequest) => Promise<RSSFeed>;
  updateFeed: (id: string, data: UpdateFeedRequest) => Promise<void>;
  deleteFeed: (id: string) => Promise<void>;
  refreshFeed: (id: string) => Promise<void>;
  refreshAllFeeds: () => Promise<void>;
  selectFeed: (feed: RSSFeed | null) => void;

  // Actions - Items
  fetchItems: (query?: ItemQuery) => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  markAsRead: (id: string, read: boolean) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  selectItem: (item: RSSItem | null) => void;

  // Actions - Map
  fetchMapItems: (query?: MapItemsQuery) => Promise<void>;

  // Actions - Filters
  setSelectedTypes: (types: FeedType[]) => void;
  setSelectedSubtypes: (subtypes: string[]) => void;
  setShowOnMap: (show: boolean) => void;
  setShowUnreadOnly: (show: boolean) => void;
  setShowStarredOnly: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Actions - UI
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useRSSStore = create<RSSStore>((set, get) => ({
  // Initial State
  feeds: [],
  items: [],
  mapItems: [],
  selectedFeed: null,
  selectedItem: null,
  selectedTypes: [],
  selectedSubtypes: [],
  showOnMap: false,
  showUnreadOnly: false,
  showStarredOnly: false,
  searchQuery: '',
  loading: false,
  error: null,
  refreshing: false,

  // Feed Actions
  fetchFeeds: async () => {
    set({ loading: true, error: null });
    try {
      const feeds = await apiClient.getFeeds();
      set({ feeds, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchFeed: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const feed = await apiClient.getFeed(id);
      set({ selectedFeed: feed, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createFeed: async (data: CreateFeedRequest) => {
    set({ loading: true, error: null });
    try {
      const feed = await apiClient.createFeed(data);
      set((state) => ({
        feeds: [...state.feeds, feed],
        loading: false,
      }));
      return feed;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateFeed: async (id: string, data: UpdateFeedRequest) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiClient.updateFeed(id, data);
      set((state) => ({
        feeds: state.feeds.map((f) => (f.id === id ? updated : f)),
        selectedFeed: state.selectedFeed?.id === id ? updated : state.selectedFeed,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteFeed: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.deleteFeed(id);
      set((state) => ({
        feeds: state.feeds.filter((f) => f.id !== id),
        selectedFeed: state.selectedFeed?.id === id ? null : state.selectedFeed,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  refreshFeed: async (id: string) => {
    set({ refreshing: true, error: null });
    try {
      await apiClient.refreshFeed(id);
      // Refresh the feed list to get updated counts
      const feeds = await apiClient.getFeeds();
      set({ feeds, refreshing: false });

      // If viewing items for this feed, refresh them
      const state = get();
      if (state.selectedFeed?.id === id) {
        await get().fetchItems({ feedIds: [id] });
      }
    } catch (error: any) {
      set({ error: error.message, refreshing: false });
    }
  },

  refreshAllFeeds: async () => {
    set({ refreshing: true, error: null });
    try {
      await apiClient.refreshAllFeeds();
      // Refresh the feed list
      const feeds = await apiClient.getFeeds();
      set({ feeds, refreshing: false });

      // Refresh items if any are loaded
      if (get().items.length > 0) {
        await get().fetchItems();
      }
    } catch (error: any) {
      set({ error: error.message, refreshing: false });
    }
  },

  selectFeed: (feed: RSSFeed | null) => {
    set({ selectedFeed: feed });
  },

  // Item Actions
  fetchItems: async (query?: ItemQuery) => {
    set({ loading: true, error: null });
    try {
      const state = get();

      // Build query from current filters
      const finalQuery: ItemQuery = {
        ...query,
        types: query?.types || (state.selectedTypes.length > 0 ? state.selectedTypes : undefined),
        subtypes: query?.subtypes || (state.selectedSubtypes.length > 0 ? state.selectedSubtypes : undefined),
        read: state.showUnreadOnly ? false : undefined,
        starred: state.showStarredOnly ? true : undefined,
        search: state.searchQuery || undefined,
        limit: query?.limit || 50,
      };

      const { items } = await apiClient.getItems(finalQuery);
      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const item = await apiClient.getItem(id);
      set({ selectedItem: item, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (id: string, read: boolean) => {
    try {
      const updated = await apiClient.markItemAsRead(id, read);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
        selectedItem: state.selectedItem?.id === id ? updated : state.selectedItem,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  toggleStar: async (id: string) => {
    try {
      const updated = await apiClient.toggleItemStar(id);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
        selectedItem: state.selectedItem?.id === id ? updated : state.selectedItem,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteItem: async (id: string) => {
    try {
      await apiClient.deleteItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  selectItem: (item: RSSItem | null) => {
    set({ selectedItem: item });
  },

  // Map Actions
  fetchMapItems: async (query?: MapItemsQuery) => {
    try {
      const state = get();

      const finalQuery: MapItemsQuery = {
        ...query,
        types: query?.types || (state.selectedTypes.length > 0 ? state.selectedTypes : undefined),
        subtypes: query?.subtypes || (state.selectedSubtypes.length > 0 ? state.selectedSubtypes : undefined),
        limit: query?.limit || 500,
      };

      const mapItems = await apiClient.getMapItems(finalQuery);
      set({ mapItems });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Filter Actions
  setSelectedTypes: (types: FeedType[]) => {
    set({ selectedTypes: types });
    get().fetchItems();
    if (get().showOnMap) {
      get().fetchMapItems();
    }
  },

  setSelectedSubtypes: (subtypes: string[]) => {
    set({ selectedSubtypes: subtypes });
    get().fetchItems();
    if (get().showOnMap) {
      get().fetchMapItems();
    }
  },

  setShowOnMap: (show: boolean) => {
    set({ showOnMap: show });
    if (show) {
      get().fetchMapItems();
    }
  },

  setShowUnreadOnly: (show: boolean) => {
    set({ showUnreadOnly: show });
    get().fetchItems();
  },

  setShowStarredOnly: (show: boolean) => {
    set({ showStarredOnly: show });
    get().fetchItems();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    set({
      selectedTypes: [],
      selectedSubtypes: [],
      showUnreadOnly: false,
      showStarredOnly: false,
      searchQuery: '',
    });
    get().fetchItems();
  },

  // UI Actions
  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
