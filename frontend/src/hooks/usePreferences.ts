'use client';

/**
 * User Preferences Hook
 * Manages user preferences with backend sync
 */

import { useState, useEffect, useCallback } from 'react';
import { UsersAPI, UserPreferences, UpdatePreferencesRequest, APIException } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';

export function usePreferences() {
  const { isAuthenticated } = useAuth();
  const { mapStyle, setMapStyle } = useAppStore();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Load preferences from backend
   */
  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      setPreferences(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userPrefs = await UsersAPI.getPreferences();
      setPreferences(userPrefs);

      // Apply preferences to app state
      if (userPrefs.mapStyle) {
        setMapStyle(userPrefs.mapStyle);
      }
    } catch (err) {
      if (err instanceof APIException) {
        setError(err.errors.join(', '));
      } else {
        setError('Failed to load preferences');
      }
      console.error('Error loading preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, setMapStyle]);

  /**
   * Update preferences on backend
   */
  const updatePreferences = useCallback(
    async (updates: UpdatePreferencesRequest): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('Must be logged in to save preferences');
        return false;
      }

      setIsSyncing(true);
      setError(null);

      try {
        const updated = await UsersAPI.updatePreferences(updates);
        setPreferences(updated);
        return true;
      } catch (err) {
        if (err instanceof APIException) {
          setError(err.errors.join(', '));
        } else {
          setError('Failed to update preferences');
        }
        console.error('Error updating preferences:', err);
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Save current map state as preferences
   */
  const saveMapState = useCallback(
    async (map: any) => {
      if (!map) return false;

      const center = map.getCenter();
      const zoom = map.getZoom();

      return updatePreferences({
        mapStyle,
        defaultZoom: zoom,
        defaultCenter: {
          lat: center.lat,
          lng: center.lng,
        },
      });
    },
    [mapStyle, updatePreferences]
  );

  /**
   * Update enabled layers
   */
  const updateEnabledLayers = useCallback(
    async (layers: string[]) => {
      return updatePreferences({
        enabledLayers: layers,
      });
    },
    [updatePreferences]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load preferences when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    } else {
      setPreferences(null);
    }
  }, [isAuthenticated, loadPreferences]);

  return {
    preferences,
    isLoading,
    isSyncing,
    error,
    updatePreferences,
    saveMapState,
    updateEnabledLayers,
    loadPreferences,
    clearError,
  };
}
