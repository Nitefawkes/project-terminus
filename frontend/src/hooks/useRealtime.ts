import { useEffect, useState, useCallback } from 'react';
import {
  websocketClient,
  SatellitePosition,
  SpaceWeatherData,
  TerminatorData,
} from '@/lib/realtime/websocket-client';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeState {
  isConnected: boolean;
  connectionState: 'connected' | 'connecting' | 'disconnected';
  satelliteData: SatellitePosition | null;
  spaceWeatherData: SpaceWeatherData | null;
  terminatorData: TerminatorData | null;
}

export function useRealtime(autoConnect: boolean = true) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    connectionState: 'disconnected',
    satelliteData: null,
    spaceWeatherData: null,
    terminatorData: null,
  });

  const updateConnectionState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: websocketClient.isConnected(),
      connectionState: websocketClient.getConnectionState(),
    }));
  }, []);

  const handleSatelliteUpdate = useCallback((data: { satellite: SatellitePosition }) => {
    setState((prev) => ({
      ...prev,
      satelliteData: data.satellite,
    }));
  }, []);

  const handleSpaceWeatherUpdate = useCallback((data: SpaceWeatherData) => {
    setState((prev) => ({
      ...prev,
      spaceWeatherData: data,
    }));
  }, []);

  const handleTerminatorUpdate = useCallback((data: TerminatorData) => {
    setState((prev) => ({
      ...prev,
      terminatorData: data,
    }));
  }, []);

  const subscribe = useCallback(async (channels: string[]) => {
    try {
      await websocketClient.subscribe(channels);
    } catch (error) {
      console.error('Failed to subscribe to channels:', error);
    }
  }, []);

  const unsubscribe = useCallback(async (channels: string[]) => {
    try {
      await websocketClient.unsubscribe(channels);
    } catch (error) {
      console.error('Failed to unsubscribe from channels:', error);
    }
  }, []);

  const connect = useCallback(() => {
    websocketClient.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketClient.disconnect();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      return;
    }

    if (autoConnect) {
      connect();
    }

    // Setup event listeners
    websocketClient.on('connect', updateConnectionState);
    websocketClient.on('disconnect', updateConnectionState);
    websocketClient.on('connected', updateConnectionState);
    websocketClient.on('satellite:update', handleSatelliteUpdate);
    websocketClient.on('space-weather:update', handleSpaceWeatherUpdate);
    websocketClient.on('terminator:update', handleTerminatorUpdate);

    // Initial state update
    updateConnectionState();

    return () => {
      websocketClient.off('connect', updateConnectionState);
      websocketClient.off('disconnect', updateConnectionState);
      websocketClient.off('connected', updateConnectionState);
      websocketClient.off('satellite:update', handleSatelliteUpdate);
      websocketClient.off('space-weather:update', handleSpaceWeatherUpdate);
      websocketClient.off('terminator:update', handleTerminatorUpdate);
    };
  }, [
    isAuthenticated,
    autoConnect,
    connect,
    disconnect,
    updateConnectionState,
    handleSatelliteUpdate,
    handleSpaceWeatherUpdate,
    handleTerminatorUpdate,
  ]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}
