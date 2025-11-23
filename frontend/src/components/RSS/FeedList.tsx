'use client';

import React, { useEffect, useState } from 'react';
import { useRSSStore } from '@/store/rssStore';
import { getFeedTypeConfig } from '@/lib/rss/feed-config';
import { RefreshCw, Edit, Trash2, Plus, Circle } from 'lucide-react';

interface FeedListProps {
  onEdit?: (feedId: string) => void;
}

export default function FeedList({ onEdit }: FeedListProps = {}) {
  const {
    feeds,
    loading,
    refreshing,
    fetchFeeds,
    refreshFeed,
    deleteFeed,
    selectFeed,
  } = useRSSStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleRefresh = async (feedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await refreshFeed(feedId);
  };

  const handleEdit = (feedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(feedId);
    }
  };

  const handleDelete = async (feedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this feed?')) {
      await deleteFeed(feedId);
    }
  };

  if (loading && feeds.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Loading feeds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">RSS Feeds</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Feed
        </button>
      </div>

      {/* Feed List */}
      {feeds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No feeds added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Add Your First Feed
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {feeds.map((feed) => {
            const config = getFeedTypeConfig(feed.type);
            const hasNewItems = feed.itemCount > 0; // Simplified - could track unread count

            return (
              <div
                key={feed.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer"
                onClick={() => selectFeed(feed)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Feed name with color indicator */}
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                      <h3 className="text-lg font-semibold text-white truncate">
                        {feed.name}
                      </h3>
                      {!feed.enabled && (
                        <span className="px-2 py-0.5 bg-gray-700 text-xs text-gray-400 rounded">
                          Disabled
                        </span>
                      )}
                    </div>

                    {/* Type and subtype */}
                    <div className="text-sm text-gray-400 mb-2">
                      Type: {config.label} › {feed.subtype}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Circle className={`w-2 h-2 ${hasNewItems ? 'fill-blue-500 text-blue-500' : ''}`} />
                        {feed.itemCount} items
                      </span>
                      {feed.lastFetched && (
                        <span>
                          Last updated: {new Date(feed.lastFetched).toLocaleString()}
                        </span>
                      )}
                      {feed.lastError && (
                        <span className="text-red-400">Error: {feed.lastError}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleRefresh(feed.id, e)}
                      disabled={refreshing}
                      className="p-2 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
                      title="Refresh feed"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleEdit(feed.id, e)}
                      className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                      title="Edit feed"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(feed.id, e)}
                      className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                      title="Delete feed"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Feed Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Add Feed</h3>
            <p className="text-gray-400 mb-4">
              Feed management modal coming soon...
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
