'use client';

import React, { useState } from 'react';
import { useRSSStore } from '@/store/rssStore';
import {
  DEFAULT_FEED_SOURCES,
  getFeedTypeConfig,
  getDefaultFeedsByType,
} from '@/lib/rss/feed-config';
import { FeedType, CreateFeedRequest } from '@/lib/api/rss-types';
import { X, Plus, Check, Loader2 } from 'lucide-react';

interface DefaultFeedsModalProps {
  onClose: () => void;
}

export default function DefaultFeedsModal({ onClose }: DefaultFeedsModalProps) {
  const { feeds, createFeed } = useRSSStore();

  const [selectedType, setSelectedType] = useState<FeedType | 'all'>('all');
  const [addingFeeds, setAddingFeeds] = useState<Set<string>>(new Set());
  const [addedFeeds, setAddedFeeds] = useState<Set<string>>(new Set());

  const existingFeedUrls = new Set(feeds.map((f) => f.url));

  const filteredSources =
    selectedType === 'all'
      ? DEFAULT_FEED_SOURCES
      : getDefaultFeedsByType(selectedType);

  const handleAddFeed = async (source: typeof DEFAULT_FEED_SOURCES[0]) => {
    const key = source.url;
    setAddingFeeds((prev) => new Set([...prev, key]));

    try {
      const createData: CreateFeedRequest = {
        name: source.name,
        url: source.url,
        type: source.type,
        subtype: source.subtype,
        enabled: true,
        refreshInterval: 15,
        geocodingEnabled: true,
      };

      await createFeed(createData);

      setAddedFeeds((prev) => new Set([...prev, key]));
    } catch (error) {
      console.error('Failed to add feed:', error);
    } finally {
      setAddingFeeds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const isAdded = (url: string) =>
    existingFeedUrls.has(url) || addedFeeds.has(url);
  const isAdding = (url: string) => addingFeeds.has(url);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              Browse Default Feeds
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Curated RSS feeds from trusted sources
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filter by Type */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({DEFAULT_FEED_SOURCES.length})
            </button>

            {Object.values(FeedType)
              .filter((type) => getDefaultFeedsByType(type).length > 0)
              .map((type) => {
                const config = getFeedTypeConfig(type);
                const count = getDefaultFeedsByType(type).length;

                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label} ({count})
                  </button>
                );
              })}
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((source) => {
              const config = getFeedTypeConfig(source.type);
              const added = isAdded(source.url);
              const adding = isAdding(source.url);

              return (
                <div
                  key={source.url}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-900/70 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Feed Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <h3 className="font-semibold text-white truncate">
                          {source.name}
                        </h3>
                      </div>

                      {/* Type and Description */}
                      <div className="text-xs text-gray-400 mb-2">
                        {config.label} › {source.subtype}
                      </div>

                      {source.description && (
                        <p className="text-sm text-gray-500">
                          {source.description}
                        </p>
                      )}

                      {/* URL */}
                      <div className="mt-2 text-xs text-gray-600 truncate">
                        {source.url}
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleAddFeed(source)}
                      disabled={added || adding}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0 ${
                        added
                          ? 'bg-green-900/30 text-green-400 border border-green-700 cursor-not-allowed'
                          : adding
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {adding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : added ? (
                        <>
                          <Check className="w-4 h-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                No default feeds available for this type
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {addedFeeds.size > 0 && `${addedFeeds.size} feed(s) added this session`}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
