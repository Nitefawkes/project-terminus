'use client';

import React from 'react';
import { RSSItem } from '@/lib/api/rss-types';
import { getFeedTypeConfig } from '@/lib/rss/feed-config';
import { useRSSStore } from '@/store/rssStore';
import { Star, MapPin, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedItemCardProps {
  item: RSSItem;
  showFeedName?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function FeedItemCard({ item, showFeedName = true, compact = false, onClick }: FeedItemCardProps) {
  const { markAsRead, toggleStar, deleteItem } = useRSSStore();

  const feedConfig = item.feed ? getFeedTypeConfig(item.feed.type) : null;
  const timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(item.id, !item.read);
  };

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStar(item.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this item?')) {
      await deleteItem(item.id);
    }
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`
        bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer
        ${!item.read ? 'border-l-4 border-l-blue-500' : ''}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          {/* Feed name and type */}
          {showFeedName && item.feed && (
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: feedConfig?.color }}
              />
              <span className="text-xs text-gray-400">
                {item.feed.name} • {feedConfig?.label}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className={`text-lg font-semibold mb-1 ${item.read ? 'text-gray-300' : 'text-white'}`}>
            {item.title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{timeAgo}</span>
            {item.author && <span>• {item.author}</span>}
            {item.geocoded && item.location && (
              <span className="flex items-center gap-1">
                • <MapPin className="w-3 h-3" /> {item.location}
              </span>
            )}
          </div>
        </div>

        {/* Star button */}
        <button
          onClick={handleToggleStar}
          className={`p-2 rounded-md transition-colors ${
            item.starred
              ? 'text-yellow-500 hover:text-yellow-400'
              : 'text-gray-500 hover:text-yellow-500'
          }`}
          title={item.starred ? 'Unstar' : 'Star'}
        >
          <Star className={`w-5 h-5 ${item.starred ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Description */}
      {!compact && item.contentSnippet && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.contentSnippet}</p>
      )}

      {/* Image */}
      {item.imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`w-full object-cover ${compact ? 'h-32' : 'h-48'}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Categories */}
      {item.categories && item.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
        <button
          onClick={handleMarkAsRead}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
          title={item.read ? 'Mark as unread' : 'Mark as read'}
        >
          {item.read ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {item.read ? 'Unread' : 'Read'}
        </button>

        <button
          onClick={handleOpenLink}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open
        </button>

        {item.geocoded && (
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title="View on map"
          >
            <MapPin className="w-3 h-3" />
            Map
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={handleDelete}
          className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
