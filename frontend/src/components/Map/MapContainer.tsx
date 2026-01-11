'use client';

import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore } from '@/store/appStore';
import { calculateTerminator, terminatorToGeoJSON } from '@/lib/terminator';
import { BUILTIN_LAYERS } from '@/lib/layers/types';
import TimeDisplay from '../TimeDisplay/TimeDisplay';
import LayerPanel from '../LayerPanel/LayerPanel';
import SpaceWeatherPanel from '../SpaceWeather/SpaceWeatherPanel';
import PropagationPanel from '../SpaceWeather/PropagationPanel';
import SatellitePanel from '../SpaceWeather/SatellitePanel';
import { Clock, Layers as LayersIcon, Maximize2, Minimize2, Activity, Radio, Satellite as SatelliteIcon } from 'lucide-react';
import { spaceWeatherAPI } from '@/lib/space-weather/api';
import { satelliteTracker } from '@/lib/space-weather/satellite';
import { clsx } from 'clsx';

maplibregl.workerUrl = new URL(
  'maplibre-gl/dist/maplibre-gl-csp-worker.js',
  import.meta.url
).toString();

const MapContainer: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const {
    mapStyle,
    kioskMode,
    setKioskMode,
    showTimePanel,
    toggleTimePanel,
    showLayerPanel,
    toggleLayerPanel,
    showSpaceWeather,
    toggleSpaceWeather,
    showPropagation,
    togglePropagation,
    showSatellite,
    toggleSatellite,
    layers,
    currentTime,
  } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize MapLibre GL map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [0, 20],
      zoom: 2,
      maxZoom: 18,
      minZoom: 1,
    });

    // Add navigation controls
    if (!kioskMode) {
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    }

    // Handle map load
    map.current.on('load', () => {
      setIsLoaded(true);
      console.log('Project Terminus - Map initialized');
      
      // Initialize terminator layer
      if (map.current) {
        initializeTerminator(map.current);
        initializeAuroraOval(map.current);
        initializeISSTracking(map.current);
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Initialize terminator layer
  const initializeTerminator = (mapInstance: maplibregl.Map) => {
    const terminatorData = calculateTerminator(new Date());
    const geoJson = terminatorToGeoJSON(terminatorData);

    // Add terminator source
    mapInstance.addSource('terminator', {
      type: 'geojson',
      data: geoJson as any,
    });

    // Add terminator line layer
    mapInstance.addLayer({
      id: 'terminator-line',
      type: 'line',
      source: 'terminator',
      paint: {
        'line-color': '#FFD700',
        'line-width': 3,
        'line-opacity': 0.8,
      },
    });

    // Add day/night fill layers
    // Create a polygon for the night side
    const nightPolygon = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-180, -90],
            [-180, 90],
            ...terminatorData.map((p) => [p.lng, p.lat]),
            [180, 90],
            [180, -90],
            [-180, -90],
          ],
        ],
      },
      properties: {},
    };

    mapInstance.addSource('night-shade', {
      type: 'geojson',
      data: nightPolygon as any,
    });

    mapInstance.addLayer({
      id: 'night-shade-layer',
      type: 'fill',
      source: 'night-shade',
      paint: {
        'fill-color': '#000033',
        'fill-opacity': 0.3,
      },
    });

    // Update terminator every 60 seconds
    setInterval(() => {
      updateTerminator(mapInstance);
    }, 60000);
  };

  // Update terminator position
  const updateTerminator = (mapInstance: maplibregl.Map) => {
    const terminatorData = calculateTerminator(new Date());
    const geoJson = terminatorToGeoJSON(terminatorData);

    const source = mapInstance.getSource('terminator') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geoJson as any);
    }

    // Update night shade
    const nightPolygon = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-180, -90],
            [-180, 90],
            ...terminatorData.map((p) => [p.lng, p.lat]),
            [180, 90],
            [180, -90],
            [-180, -90],
          ],
        ],
      },
      properties: {},
    };

    const nightSource = mapInstance.getSource('night-shade') as maplibregl.GeoJSONSource;
    if (nightSource) {
      nightSource.setData(nightPolygon as any);
    }
  };

  // Initialize aurora oval layer
  const initializeAuroraOval = async (mapInstance: maplibregl.Map) => {
    try {
      const auroraData = await spaceWeatherAPI.getAuroraOval();
      if (!auroraData) return;

      // Create GeoJSON for aurora oval
      const auroraGeoJson = {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: auroraData.coordinates.map(c => [c.lng, c.lat]),
        },
        properties: {
          intensity: auroraData.intensity,
        },
      };

      mapInstance.addSource('aurora-oval', {
        type: 'geojson',
        data: auroraGeoJson as any,
      });

      mapInstance.addLayer({
        id: 'aurora-oval-line',
        type: 'line',
        source: 'aurora-oval',
        paint: {
          'line-color': '#00ff88',
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      // Add aurora zone fill
      const auroraZone = {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              ...auroraData.coordinates.map(c => [c.lng, c.lat]),
              [180, 90],
              [-180, 90],
              [auroraData.coordinates[0].lng, auroraData.coordinates[0].lat],
            ],
          ],
        },
        properties: {},
      };

      mapInstance.addSource('aurora-zone', {
        type: 'geojson',
        data: auroraZone as any,
      });

      mapInstance.addLayer({
        id: 'aurora-zone-fill',
        type: 'fill',
        source: 'aurora-zone',
        paint: {
          'fill-color': '#00ff88',
          'fill-opacity': 0.15,
        },
      });

      // Update every 15 minutes
      setInterval(() => updateAuroraOval(mapInstance), 15 * 60 * 1000);
    } catch (error) {
      console.error('Failed to initialize aurora oval:', error);
    }
  };

  // Update aurora oval
  const updateAuroraOval = async (mapInstance: maplibregl.Map) => {
    try {
      const auroraData = await spaceWeatherAPI.getAuroraOval();
      if (!auroraData) return;

      const auroraGeoJson = {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: auroraData.coordinates.map(c => [c.lng, c.lat]),
        },
        properties: {
          intensity: auroraData.intensity,
        },
      };

      const source = mapInstance.getSource('aurora-oval') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(auroraGeoJson as any);
      }
    } catch (error) {
      console.error('Failed to update aurora oval:', error);
    }
  };

  // Initialize ISS tracking
  const initializeISSTracking = async (mapInstance: maplibregl.Map) => {
    try {
      const issPosition = await satelliteTracker.getISSPosition();
      if (!issPosition) return;

      // Add ISS marker
      const issPoint = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [issPosition.longitude, issPosition.latitude],
        },
        properties: {
          name: issPosition.name,
          altitude: issPosition.altitude,
        },
      };

      mapInstance.addSource('iss-position', {
        type: 'geojson',
        data: issPoint as any,
      });

      mapInstance.addLayer({
        id: 'iss-marker',
        type: 'circle',
        source: 'iss-position',
        paint: {
          'circle-radius': 8,
          'circle-color': '#00ff00',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      // Add ISS ground track
      const groundTrack = await satelliteTracker.getISSGroundTrack();
      if (groundTrack.length > 0) {
        const trackGeoJson = {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: groundTrack.map(p => [p.lng, p.lat]),
          },
          properties: {},
        };

        mapInstance.addSource('iss-track', {
          type: 'geojson',
          data: trackGeoJson as any,
        });

        mapInstance.addLayer({
          id: 'iss-track-line',
          type: 'line',
          source: 'iss-track',
          paint: {
            'line-color': '#00ff00',
            'line-width': 1,
            'line-opacity': 0.5,
            'line-dasharray': [2, 2],
          },
        });
      }

      // Update every 10 seconds
      setInterval(() => updateISSTracking(mapInstance), 10 * 1000);
    } catch (error) {
      console.error('Failed to initialize ISS tracking:', error);
    }
  };

  // Update ISS tracking
  const updateISSTracking = async (mapInstance: maplibregl.Map) => {
    try {
      const issPosition = await satelliteTracker.getISSPosition();
      if (!issPosition) return;

      const issPoint = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [issPosition.longitude, issPosition.latitude],
        },
        properties: {
          name: issPosition.name,
          altitude: issPosition.altitude,
        },
      };

      const source = mapInstance.getSource('iss-position') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(issPoint as any);
      }
    } catch (error) {
      console.error('Failed to update ISS tracking:', error);
    }
  };

  // Update terminator when time changes
  useEffect(() => {
    if (map.current && isLoaded) {
      updateTerminator(map.current);
    }
  }, [currentTime, isLoaded]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="terminus-map"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Project Terminus</h2>
            <p className="text-gray-400">Initializing living world map...</p>
          </div>
        </div>
      )}

      {/* UI Overlays - Only show when not in kiosk mode */}
      {isLoaded && !kioskMode && (
        <>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Project Terminus</h1>
                <p className="text-sm text-gray-300">Living World Clock & Intelligence Dashboard</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTimePanel}
                  className={clsx(
                    'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                    showTimePanel
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  )}
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Time</span>
                </button>
                <button
                  onClick={toggleSpaceWeather}
                  className={clsx(
                    'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                    showSpaceWeather
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  )}
                  title="Space Weather"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden lg:inline">Weather</span>
                </button>
                <button
                  onClick={togglePropagation}
                  className={clsx(
                    'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                    showPropagation
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  )}
                  title="HF/VHF Propagation"
                >
                  <Radio className="w-4 h-4" />
                  <span className="hidden lg:inline">Radio</span>
                </button>
                <button
                  onClick={toggleSatellite}
                  className={clsx(
                    'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                    showSatellite
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  )}
                  title="ISS Tracking"
                >
                  <SatelliteIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">ISS</span>
                </button>
                <button
                  onClick={toggleLayerPanel}
                  className={clsx(
                    'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                    showLayerPanel
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  )}
                  title="Map Layers"
                >
                  <LayersIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setKioskMode(true)}
                  className="px-4 py-2 rounded-lg bg-gray-800/80 text-gray-300 hover:bg-gray-700 transition-all"
                  title="Enter Kiosk Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Time Panel */}
          {showTimePanel && (
            <div className="absolute top-24 left-4 z-20">
              <TimeDisplay />
            </div>
          )}

          {/* Space Weather Panel */}
          {showSpaceWeather && (
            <div className="absolute top-24 left-4 z-20">
              <SpaceWeatherPanel />
            </div>
          )}

          {/* Propagation Panel */}
          {showPropagation && (
            <div className="absolute top-24 left-4 z-20">
              <PropagationPanel />
            </div>
          )}

          {/* Satellite Panel */}
          {showSatellite && (
            <div className="absolute top-24 right-4 z-20">
              <SatellitePanel />
            </div>
          )}

          {/* Layer Panel */}
          {showLayerPanel && (
            <div className="absolute top-24 right-4 z-20">
              <LayerPanel />
            </div>
          )}
        </>
      )}

      {/* Kiosk Mode - Minimal UI */}
      {isLoaded && kioskMode && (
        <>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <TimeDisplay />
          </div>
          <button
            onClick={() => setKioskMode(false)}
            className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-all z-10"
            title="Exit Kiosk Mode"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Status Bar */}
      {isLoaded && !kioskMode && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </span>
              <span>|</span>
              <span>Terminator</span>
              <span>•</span>
              <span>Aurora Oval</span>
              <span>•</span>
              <span>ISS Live</span>
            </div>
            <div className="flex items-center gap-3">
              <span>&copy; OpenStreetMap</span>
              <span>|</span>
              <span>Project Terminus v0.1.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
