/**
 * Global application state using Zustand
 */

import { create } from 'zustand';
import { LayerManifest, LayerState } from '@/lib/layers/types';

interface AppState {
  // Time state
  currentTime: Date;
  updateTime: () => void;
  
  // Map state
  mapStyle: 'dark' | 'light' | 'satellite';
  setMapStyle: (style: 'dark' | 'light' | 'satellite') => void;
  
  // Layer state
  layers: Record<string, LayerManifest>;
  layerStates: Record<string, LayerState>;
  toggleLayer: (layerId: string) => void;
  setLayerLoading: (layerId: string, loading: boolean) => void;
  setLayerError: (layerId: string, error: string | undefined) => void;
  setLayerData: (layerId: string, data: any) => void;
  
  // UI state
  kioskMode: boolean;
  setKioskMode: (enabled: boolean) => void;
  showTimePanel: boolean;
  toggleTimePanel: () => void;
  showLayerPanel: boolean;
  toggleLayerPanel: () => void;
  showSpaceWeather: boolean;
  toggleSpaceWeather: () => void;
  showPropagation: boolean;
  togglePropagation: () => void;
  showSatellite: boolean;
  toggleSatellite: () => void;
  showRSS: boolean;
  toggleRSS: () => void;

  // User preferences
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Time state
  currentTime: new Date(),
  updateTime: () => set({ currentTime: new Date() }),
  
  // Map state
  mapStyle: 'dark',
  setMapStyle: (style) => set({ mapStyle: style }),
  
  // Layer state
  layers: {},
  layerStates: {},
  toggleLayer: (layerId) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerId]: {
          ...state.layers[layerId],
          enabled: !state.layers[layerId]?.enabled,
        },
      },
    })),
  setLayerLoading: (layerId, loading) =>
    set((state) => ({
      layerStates: {
        ...state.layerStates,
        [layerId]: {
          ...state.layerStates[layerId],
          id: layerId,
          visible: state.layers[layerId]?.enabled ?? false,
          loading,
        },
      },
    })),
  setLayerError: (layerId, error) =>
    set((state) => ({
      layerStates: {
        ...state.layerStates,
        [layerId]: {
          ...state.layerStates[layerId],
          id: layerId,
          visible: state.layers[layerId]?.enabled ?? false,
          loading: false,
          error,
        },
      },
    })),
  setLayerData: (layerId, data) =>
    set((state) => ({
      layerStates: {
        ...state.layerStates,
        [layerId]: {
          ...state.layerStates[layerId],
          id: layerId,
          visible: state.layers[layerId]?.enabled ?? false,
          loading: false,
          data,
          lastUpdate: new Date(),
        },
      },
    })),
  
  // UI state
  kioskMode: false,
  setKioskMode: (enabled) => set({ kioskMode: enabled }),
  showTimePanel: true,
  toggleTimePanel: () => set((state) => ({ showTimePanel: !state.showTimePanel })),
  showLayerPanel: false,
  toggleLayerPanel: () => set((state) => ({ showLayerPanel: !state.showLayerPanel })),
  showSpaceWeather: false,
  toggleSpaceWeather: () => set((state) => ({ showSpaceWeather: !state.showSpaceWeather })),
  showPropagation: false,
  togglePropagation: () => set((state) => ({ showPropagation: !state.showPropagation })),
  showSatellite: false,
  toggleSatellite: () => set((state) => ({ showSatellite: !state.showSatellite })),
  showRSS: false,
  toggleRSS: () => set((state) => ({ showRSS: !state.showRSS })),

  // User preferences
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),
}));

// Time update interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    useAppStore.getState().updateTime();
  }, 1000);
}
