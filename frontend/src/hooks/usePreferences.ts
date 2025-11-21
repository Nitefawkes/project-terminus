'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { UserPreferences, UpdatePreferencesRequest } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';

export function usePreferences() {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPreferences();
      setPreferences(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load preferences';
      setError(errorMessage);
      console.error('Failed to fetch preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (data: UpdatePreferencesRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apiClient.updatePreferences(data);
      setPreferences(updated);
      return updated;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update preferences';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [isAuthenticated]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
