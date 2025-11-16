'use client';

/**
 * Pin Management Hook
 * Custom hook for managing user pins with backend integration
 */

import { useState, useEffect, useCallback } from 'react';
import { UsersAPI, Pin, CreatePinRequest, APIException } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function usePins() {
  const { isAuthenticated } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load pins from backend
   */
  const loadPins = useCallback(async () => {
    if (!isAuthenticated) {
      setPins([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userPins = await UsersAPI.getPins();
      setPins(userPins);
    } catch (err) {
      if (err instanceof APIException) {
        setError(err.errors.join(', '));
      } else {
        setError('Failed to load pins');
      }
      console.error('Error loading pins:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Create a new pin
   */
  const createPin = useCallback(
    async (data: CreatePinRequest): Promise<Pin | null> => {
      if (!isAuthenticated) {
        setError('Must be logged in to create pins');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const newPin = await UsersAPI.createPin(data);
        setPins((prev) => [...prev, newPin]);
        return newPin;
      } catch (err) {
        if (err instanceof APIException) {
          setError(err.errors.join(', '));
        } else {
          setError('Failed to create pin');
        }
        console.error('Error creating pin:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Delete a pin
   */
  const deletePin = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('Must be logged in to delete pins');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        await UsersAPI.deletePin(id);
        setPins((prev) => prev.filter((pin) => pin.id !== id));
        return true;
      } catch (err) {
        if (err instanceof APIException) {
          setError(err.errors.join(', '));
        } else {
          setError('Failed to delete pin');
        }
        console.error('Error deleting pin:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Update a pin
   */
  const updatePin = useCallback(
    async (id: string, data: Partial<CreatePinRequest>): Promise<Pin | null> => {
      if (!isAuthenticated) {
        setError('Must be logged in to update pins');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedPin = await UsersAPI.updatePin(id, data);
        setPins((prev) => prev.map((pin) => (pin.id === id ? updatedPin : pin)));
        return updatedPin;
      } catch (err) {
        if (err instanceof APIException) {
          setError(err.errors.join(', '));
        } else {
          setError('Failed to update pin');
        }
        console.error('Error updating pin:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load pins when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPins();
    } else {
      setPins([]);
    }
  }, [isAuthenticated, loadPins]);

  return {
    pins,
    isLoading,
    error,
    createPin,
    deletePin,
    updatePin,
    loadPins,
    clearError,
  };
}
