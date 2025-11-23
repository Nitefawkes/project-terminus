'use client';

import React, { useEffect } from 'react';
import { useRSSStore } from '@/store/rssStore';
import { getFeedTypeConfig } from '@/lib/rss/feed-config';
import { FeedType } from '@/lib/api/rss-types';
import { X, RefreshCw, MapPin, Filter, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RSSPanelProps {
  onClose: () => void;
}

export default function RSSPanel({ onClose }: RSSPanelProps) {
  const router = useRouter();

  const {
    mapItems,
    selectedTypes,
    loading,
    refreshing,
    fetchMapItems,
    refreshAllFeeds,
    setSelectedTypes,
  } = useRSSStore();

  useEffect(() => {
    fetchMapItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await refreshAllFeeds();
    await fetchMapItems();
  };

  const toggleType = (type: FeedType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const geocodedCount = mapItems.filter((item) => item.geocoded).length;

  return (
    <div className="w-80 h-full bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">RSS Map Layer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-400">
          Displaying {geocodedCount} geocoded article{geocodedCount !== 1 ? 's' : ''} on map
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-gray-800 space-y-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Feeds'}
        </button>

        <button
          onClick={() => router.push('/feeds')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          <List className="w-4 h-4" />
          View All Articles
        </button>
      </div>

      {/* Feed Type Filters */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <h4 className="font-semibold text-sm text-gray-300">Filter by Type</h4>
          </div>

          <div className="space-y-2">
            {Object.values(FeedType).map((type) => {
              const config = getFeedTypeConfig(type);
              const isSelected = selectedTypes.includes(type);
              const count = mapItems.filter(
                (item) => item.feed?.type === type && item.geocoded
              ).length;

              if (count === 0) {
                return null; // Hide types with no items
              }

              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gray-800 border-2 border-blue-500'
                      : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="text-left min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {count} location{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {mapItems.filter((item) => item.geocoded).length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-2">
                No geocoded articles available
              </p>
              <p className="text-xs text-gray-500">
                Add feeds with location data to see them on the map
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Articles are geocoded from RSS feed location data
        </p>
      </div>
    </div>
  );
}
