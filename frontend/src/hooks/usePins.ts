'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Pin, CreatePinRequest } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';

export function usePins() {
  const { isAuthenticated } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPins = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPins();
      setPins(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load pins';
      setError(errorMessage);
      console.error('Failed to fetch pins:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPin = async (data: CreatePinRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newPin = await apiClient.createPin(data);
      setPins((prev) => [...prev, newPin]);
      return newPin;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create pin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePin = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deletePin(id);
      setPins((prev) => prev.filter((pin) => pin.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete pin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [isAuthenticated]);

  return {
    pins,
    loading,
    error,
    createPin,
    deletePin,
    refetch: fetchPins,
  };
}
