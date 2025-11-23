'use client';

import React, { useState, useEffect } from 'react';
import { useRSSStore } from '@/store/rssStore';
import { getFeedTypeConfig, FEED_TYPE_CONFIGS } from '@/lib/rss/feed-config';
import { FeedType, CreateFeedRequest, UpdateFeedRequest } from '@/lib/api/rss-types';
import { X, Loader2 } from 'lucide-react';

interface FeedFormModalProps {
  feedId?: string | null;
  onClose: () => void;
}

export default function FeedFormModal({ feedId, onClose }: FeedFormModalProps) {
  const { feeds, createFeed, updateFeed, loading } = useRSSStore();

  const existingFeed = feedId ? feeds.find((f) => f.id === feedId) : null;

  const [formData, setFormData] = useState({
    name: existingFeed?.name || '',
    url: existingFeed?.url || '',
    type: existingFeed?.type || FeedType.NEWS,
    subtype: existingFeed?.subtype || '',
    enabled: existingFeed?.enabled ?? true,
    refreshInterval: existingFeed?.refreshInterval || 15,
    geocodingEnabled: existingFeed?.geocodingEnabled ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedTypeConfig = getFeedTypeConfig(formData.type);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Feed name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Feed URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if (!formData.subtype) {
      newErrors.subtype = 'Subtype is required';
    }

    if (formData.refreshInterval < 5) {
      newErrors.refreshInterval = 'Refresh interval must be at least 5 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      if (feedId) {
        // Update existing feed
        const updateData: UpdateFeedRequest = {
          name: formData.name,
          enabled: formData.enabled,
          refreshInterval: formData.refreshInterval,
          geocodingEnabled: formData.geocodingEnabled,
        };
        await updateFeed(feedId, updateData);
      } else {
        // Create new feed
        const createData: CreateFeedRequest = {
          name: formData.name,
          url: formData.url,
          type: formData.type,
          subtype: formData.subtype,
          enabled: formData.enabled,
          refreshInterval: formData.refreshInterval,
          geocodingEnabled: formData.geocodingEnabled,
        };
        await createFeed(createData);
      }

      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save feed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {feedId ? 'Edit Feed' : 'Add New Feed'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feed Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feed Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Reuters World News"
              className={`w-full px-4 py-2 bg-gray-900 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Feed URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feed URL *
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/feed.xml"
              disabled={!!feedId} // Can't change URL when editing
              className={`w-full px-4 py-2 bg-gray-900 border ${
                errors.url ? 'border-red-500' : 'border-gray-700'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-400">{errors.url}</p>
            )}
            {feedId && (
              <p className="mt-1 text-xs text-gray-500">
                URL cannot be changed after creation
              </p>
            )}
          </div>

          {/* Feed Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feed Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as FeedType;
                const newConfig = getFeedTypeConfig(newType);
                setFormData({
                  ...formData,
                  type: newType,
                  subtype: newConfig.subtypes[0]?.value || '',
                });
              }}
              disabled={!!feedId} // Can't change type when editing
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Object.values(FeedType).map((type) => {
                const config = getFeedTypeConfig(type);
                return (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                );
              })}
            </select>
            {feedId && (
              <p className="mt-1 text-xs text-gray-500">
                Type cannot be changed after creation
              </p>
            )}
          </div>

          {/* Feed Subtype */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtype *
            </label>
            <select
              value={formData.subtype}
              onChange={(e) =>
                setFormData({ ...formData, subtype: e.target.value })
              }
              disabled={!!feedId} // Can't change subtype when editing
              className={`w-full px-4 py-2 bg-gray-900 border ${
                errors.subtype ? 'border-red-500' : 'border-gray-700'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {selectedTypeConfig.subtypes.map((subtype) => (
                <option key={subtype.value} value={subtype.value}>
                  {subtype.label}
                </option>
              ))}
            </select>
            {errors.subtype && (
              <p className="mt-1 text-sm text-red-400">{errors.subtype}</p>
            )}
            {feedId && (
              <p className="mt-1 text-xs text-gray-500">
                Subtype cannot be changed after creation
              </p>
            )}
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refresh Interval (minutes) *
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={formData.refreshInterval}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  refreshInterval: parseInt(e.target.value) || 15,
                })
              }
              className={`w-full px-4 py-2 bg-gray-900 border ${
                errors.refreshInterval ? 'border-red-500' : 'border-gray-700'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
            />
            {errors.refreshInterval && (
              <p className="mt-1 text-sm text-red-400">{errors.refreshInterval}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              How often to check for new items (minimum: 5 minutes)
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) =>
                  setFormData({ ...formData, enabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">
                  Enable Feed
                </div>
                <div className="text-xs text-gray-500">
                  Fetch new items on schedule
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.geocodingEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, geocodingEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-300">
                  Enable Geocoding
                </div>
                <div className="text-xs text-gray-500">
                  Automatically extract locations and display on map
                </div>
              </div>
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {feedId ? 'Update Feed' : 'Add Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
