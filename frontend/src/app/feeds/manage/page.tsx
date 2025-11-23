'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FeedList from '@/components/RSS/FeedList';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import FeedFormModal from '@/components/RSS/FeedFormModal';
import DefaultFeedsModal from '@/components/RSS/DefaultFeedsModal';

export default function ManageFeedsPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDefaultsModal, setShowDefaultsModal] = useState(false);
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-md transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">Manage RSS Feeds</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDefaultsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Browse Defaults
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feed
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-400">
            Add and manage RSS feeds from various sources. Feeds are automatically
            refreshed every 10 minutes.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FeedList onEdit={(feedId) => setEditingFeedId(feedId)} />
      </div>

      {/* Add/Edit Feed Modal */}
      {(showAddModal || editingFeedId) && (
        <FeedFormModal
          feedId={editingFeedId}
          onClose={() => {
            setShowAddModal(false);
            setEditingFeedId(null);
          }}
        />
      )}

      {/* Default Feeds Modal */}
      {showDefaultsModal && (
        <DefaultFeedsModal onClose={() => setShowDefaultsModal(false)} />
      )}
    </div>
  );
}
