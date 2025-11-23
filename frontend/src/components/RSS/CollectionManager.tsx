'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import {
  FeedCollection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  RSSFeed,
} from '@/lib/api/rss-types';
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  Star,
  X,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface CollectionManagerProps {
  onCollectionSelect?: (collection: FeedCollection | null) => void;
  selectedCollectionId?: string | null;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function CollectionManager({
  onCollectionSelect,
  selectedCollectionId,
}: CollectionManagerProps) {
  const [collections, setCollections] = useState<FeedCollection[]>([]);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<FeedCollection | null>(null);
  const [expandedCollectionId, setExpandedCollectionId] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
    loadFeeds();
  }, []);

  async function loadCollections() {
    try {
      setLoading(true);
      const data = await apiClient.getCollections();
      setCollections(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  }

  async function loadFeeds() {
    try {
      const data = await apiClient.getFeeds();
      setFeeds(data);
    } catch (err) {
      console.error('Failed to load feeds:', err);
    }
  }

  async function handleCreateCollection(data: CreateCollectionRequest) {
    try {
      await apiClient.createCollection(data);
      await loadCollections();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create collection:', err);
      alert('Failed to create collection');
    }
  }

  async function handleUpdateCollection(id: string, data: UpdateCollectionRequest) {
    try {
      await apiClient.updateCollection(id, data);
      await loadCollections();
      setEditingCollection(null);
    } catch (err) {
      console.error('Failed to update collection:', err);
      alert('Failed to update collection');
    }
  }

  async function handleDeleteCollection(id: string) {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      await apiClient.deleteCollection(id);
      await loadCollections();
      if (selectedCollectionId === id) {
        onCollectionSelect?.(null);
      }
    } catch (err) {
      console.error('Failed to delete collection:', err);
      alert('Failed to delete collection');
    }
  }

  async function handleToggleDefault(collection: FeedCollection) {
    try {
      await apiClient.updateCollection(collection.id, {
        isDefault: !collection.isDefault,
      });
      await loadCollections();
    } catch (err) {
      console.error('Failed to toggle default:', err);
      alert('Failed to update default collection');
    }
  }

  function handleCollectionClick(collection: FeedCollection) {
    if (selectedCollectionId === collection.id) {
      onCollectionSelect?.(null);
    } else {
      onCollectionSelect?.(collection);
    }
  }

  function toggleExpanded(collectionId: string) {
    setExpandedCollectionId(
      expandedCollectionId === collectionId ? null : collectionId
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading collections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Collections
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Create new collection"
        >
          <FolderPlus size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Folder size={48} className="mx-auto mb-2 opacity-50" />
          <p>No collections yet</p>
          <p className="text-sm mt-1">Create one to organize your feeds</p>
        </div>
      ) : (
        <div className="space-y-1">
          {collections.map((collection) => (
            <div key={collection.id} className="group">
              <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedCollectionId === collection.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <button
                  onClick={() => toggleExpanded(collection.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  {expandedCollectionId === collection.id ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                <div
                  onClick={() => handleCollectionClick(collection)}
                  className="flex-1 flex items-center gap-2"
                >
                  <Folder
                    size={18}
                    style={{ color: collection.color || '#6B7280' }}
                    fill={selectedCollectionId === collection.id ? 'currentColor' : 'none'}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {collection.name}
                  </span>
                  {collection.isDefault && (
                    <Star size={14} className="text-yellow-500" fill="currentColor" />
                  )}
                  <span className="text-xs text-gray-500">
                    ({collection.feeds?.length || 0})
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleDefault(collection)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title={collection.isDefault ? 'Unset as default' : 'Set as default'}
                  >
                    <Star
                      size={14}
                      className={collection.isDefault ? 'text-yellow-500' : 'text-gray-400'}
                      fill={collection.isDefault ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    onClick={() => setEditingCollection(collection)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Edit collection"
                  >
                    <Edit2 size={14} className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    title="Delete collection"
                  >
                    <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              {expandedCollectionId === collection.id && (
                <div className="ml-8 mt-1 space-y-1">
                  {collection.feeds && collection.feeds.length > 0 ? (
                    collection.feeds.map((feed) => (
                      <div
                        key={feed.id}
                        className="text-xs text-gray-600 dark:text-gray-400 py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      >
                        {feed.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 italic py-1 px-2">
                      No feeds in this collection
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CollectionFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCollection}
          availableFeeds={feeds}
        />
      )}

      {editingCollection && (
        <CollectionFormModal
          collection={editingCollection}
          onClose={() => setEditingCollection(null)}
          onSubmit={(data) => handleUpdateCollection(editingCollection.id, data)}
          availableFeeds={feeds}
        />
      )}
    </div>
  );
}

interface CollectionFormModalProps {
  collection?: FeedCollection;
  onClose: () => void;
  onSubmit: (data: CreateCollectionRequest | UpdateCollectionRequest) => void;
  availableFeeds: RSSFeed[];
}

function CollectionFormModal({
  collection,
  onClose,
  onSubmit,
  availableFeeds,
}: CollectionFormModalProps) {
  const [name, setName] = useState(collection?.name || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [color, setColor] = useState(collection?.color || PRESET_COLORS[0]);
  const [isDefault, setIsDefault] = useState(collection?.isDefault || false);
  const [selectedFeedIds, setSelectedFeedIds] = useState<string[]>(
    collection?.feeds?.map((f) => f.id) || []
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: CreateCollectionRequest | UpdateCollectionRequest = {
      name,
      description: description || undefined,
      color,
      isDefault,
      ...(collection ? {} : { feedIds: selectedFeedIds }),
    };

    onSubmit(data);
  }

  function toggleFeed(feedId: string) {
    setSelectedFeedIds((prev) =>
      prev.includes(feedId)
        ? prev.filter((id) => id !== feedId)
        : [...prev, feedId]
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {collection ? 'Edit Collection' : 'Create Collection'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Middle East Threats"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === presetColor
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                Set as default collection (auto-load on login)
              </label>
            </div>

            {!collection && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Feeds (optional)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                  {availableFeeds.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No feeds available
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {availableFeeds.map((feed) => (
                        <label
                          key={feed.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeedIds.includes(feed.id)}
                            onChange={() => toggleFeed(feed.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feed.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {collection ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
