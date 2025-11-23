'use client';

import React, { useEffect, useState } from 'react';
import { useRSSStore } from '@/store/rssStore';
import FeedItemCard from '@/components/RSS/FeedItemCard';
import { getFeedTypeConfig, FEED_TYPE_CONFIGS } from '@/lib/rss/feed-config';
import { FeedType } from '@/lib/api/rss-types';
import {
  Search,
  Filter,
  RefreshCw,
  Grid3x3,
  List,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react';

type ViewMode = 'timeline' | 'grid';

export default function FeedsPage() {
  const {
    items,
    loading,
    refreshing,
    selectedTypes,
    selectedSubtypes,
    showUnreadOnly,
    showStarredOnly,
    searchQuery,
    fetchItems,
    refreshAllFeeds,
    setSelectedTypes,
    setSelectedSubtypes,
    setShowUnreadOnly,
    setShowStarredOnly,
    setSearchQuery,
    clearFilters,
  } = useRSSStore();

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    fetchItems();
  };

  const handleRefreshAll = async () => {
    await refreshAllFeeds();
  };

  const toggleType = (type: FeedType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getAvailableSubtypes = () => {
    if (selectedTypes.length === 0) {
      return [];
    }

    const subtypes: { value: string; label: string; type: FeedType }[] = [];
    selectedTypes.forEach((type) => {
      const config = getFeedTypeConfig(type);
      config.subtypes.forEach((subtype) => {
        subtypes.push({
          ...subtype,
          type,
        });
      });
    });

    return subtypes;
  };

  const toggleSubtype = (subtype: string) => {
    if (selectedSubtypes.includes(subtype)) {
      setSelectedSubtypes(selectedSubtypes.filter((s) => s !== subtype));
    } else {
      setSelectedSubtypes([...selectedSubtypes, subtype]);
    }
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedSubtypes.length > 0 ||
    showUnreadOnly ||
    showStarredOnly ||
    searchQuery;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">RSS Feeds</h1>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-md p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Timeline view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh All */}
              <button
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
                title="Refresh all feeds"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>

              {/* Manage Feeds */}
              <a
                href="/feeds/manage"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                Manage Feeds
              </a>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[
                    selectedTypes.length,
                    selectedSubtypes.length,
                    showUnreadOnly ? 1 : 0,
                    showStarredOnly ? 1 : 0,
                    searchQuery ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-300">
                  Filter Options
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Feed Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Feed Types
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {Object.values(FeedType).map((type) => {
                      const config = getFeedTypeConfig(type);
                      return (
                        <label
                          key={type}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700/50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                            className="rounded border-gray-600"
                          />
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: config.color }}
                          />
                          <span>{config.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Subtype Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Subtypes
                  </label>
                  {selectedTypes.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      Select a feed type first
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {getAvailableSubtypes().map((subtype) => (
                        <label
                          key={subtype.value}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700/50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubtypes.includes(subtype.value)}
                            onChange={() => toggleSubtype(subtype.value)}
                            className="rounded border-gray-600"
                          />
                          <span>{subtype.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Filters */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={showUnreadOnly}
                        onChange={(e) => setShowUnreadOnly(e.target.checked)}
                        className="rounded border-gray-600"
                      />
                      <span>Unread only</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={showStarredOnly}
                        onChange={(e) => setShowStarredOnly(e.target.checked)}
                        className="rounded border-gray-600"
                      />
                      <span>Starred only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading articles...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {hasActiveFilters
                ? 'No articles match your filters'
                : 'No articles available'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-400">
              Showing {items.length} article{items.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </div>

            {/* Items Display */}
            {viewMode === 'timeline' ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <FeedItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <FeedItemCard key={item.id} item={item} compact />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
