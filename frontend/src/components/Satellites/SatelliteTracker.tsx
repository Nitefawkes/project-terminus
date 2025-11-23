'use client';

import { useState, useEffect } from 'react';
import { MapsAPI, PopularSatellite, SatellitePosition } from '@/lib/api/maps';
import { DashboardAPI } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import {
  Satellite as SatelliteIcon,
  Star,
  Loader,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  Navigation,
  X,
} from 'lucide-react';

interface SatelliteTrackerProps {
  onSatelliteSelect?: (satellite: SatellitePosition) => void;
  onClose?: () => void;
}

export function SatelliteTracker({ onSatelliteSelect, onClose }: SatelliteTrackerProps) {
  const { isAuthenticated } = useAuth();
  const [popularSatellites, setPopularSatellites] = useState<PopularSatellite[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [satellitePositions, setSatellitePositions] = useState<Map<number, SatellitePosition>>(
    new Map()
  );
  const [observerLocation, setObserverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Auto-refresh satellite positions every 10 seconds
  useEffect(() => {
    if (!isAuthenticated || favorites.length === 0) return;

    const interval = setInterval(() => {
      updateFavoritePositions();
    }, 10000);

    return () => clearInterval(interval);
  }, [favorites, isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Load popular satellites, favorites, and observer location in parallel
      const [popular, favs, location] = await Promise.all([
        MapsAPI.getPopularSatellites(),
        DashboardAPI.getFavoriteSatellites(),
        DashboardAPI.getObserverLocation(),
      ]);

      setPopularSatellites(popular);
      setFavorites(favs);
      if (location) {
        setObserverLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      // Load positions for favorites
      if (favs.length > 0) {
        await updateFavoritePositions(favs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load satellite data');
      console.error('Failed to load satellite data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFavoritePositions = async (favoriteIds?: number[]) => {
    const ids = favoriteIds || favorites;
    if (ids.length === 0) return;

    try {
      const positions = await MapsAPI.getSatellitePositions(ids);
      const posMap = new Map<number, SatellitePosition>();
      positions.forEach((pos) => {
        posMap.set(pos.noradId, pos);
      });
      setSatellitePositions(posMap);
    } catch (err) {
      console.error('Failed to update satellite positions:', err);
    }
  };

  const toggleFavorite = async (noradId: number) => {
    try {
      if (favorites.includes(noradId)) {
        await DashboardAPI.removeFavoriteSatellite(noradId);
        setFavorites(favorites.filter((id) => id !== noradId));
        setSatellitePositions((prev) => {
          const newMap = new Map(prev);
          newMap.delete(noradId);
          return newMap;
        });
      } else {
        await DashboardAPI.addFavoriteSatellite(noradId);
        setFavorites([...favorites, noradId]);
        // Load position for newly added favorite
        try {
          const positions = await MapsAPI.getSatellitePositions([noradId]);
          if (positions.length > 0) {
            setSatellitePositions((prev) => new Map(prev).set(noradId, positions[0]));
          }
        } catch (err) {
          console.error('Failed to load satellite position:', err);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update favorites');
    }
  };

  const handleSatelliteClick = (satellite: PopularSatellite) => {
    const position = satellitePositions.get(satellite.noradId);
    if (position && onSatelliteSelect) {
      onSatelliteSelect(position);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(popularSatellites.map((s) => s.category)));

  // Filter satellites
  const filteredSatellites = popularSatellites.filter((sat) => {
    if (showFavoritesOnly && !favorites.includes(sat.noradId)) return false;
    if (selectedCategory && sat.category !== selectedCategory) return false;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center">
          <SatelliteIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Please login to track satellites</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-300">Loading satellites...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
        <div className="flex items-center gap-3">
          <SatelliteIcon className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Satellite Tracker</h3>
            <p className="text-xs text-gray-400">
              {favorites.length} favorites • {filteredSatellites.length} shown
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Observer Location Notice */}
      {!observerLocation && (
        <div className="p-3 bg-yellow-900/20 border-b border-yellow-700/30 text-yellow-200 text-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            <span>
              Set your observer location in{' '}
              <a href="/profile" className="underline hover:text-yellow-100">
                Profile
              </a>{' '}
              for accurate visibility calculations
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/20 border-b border-red-700/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="p-3 border-b border-gray-700 space-y-2 bg-gray-800/30">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-xs rounded transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Favorites Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`w-full px-3 py-2 text-sm rounded transition flex items-center justify-center gap-2 ${
            showFavoritesOnly
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
          {showFavoritesOnly ? 'Showing Favorites Only' : 'Show All Satellites'}
        </button>
      </div>

      {/* Satellites List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSatellites.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <SatelliteIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No satellites to display</p>
            {showFavoritesOnly && <p className="text-sm mt-1">Add some favorites to track them</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredSatellites.map((satellite) => {
              const isFavorite = favorites.includes(satellite.noradId);
              const position = satellitePositions.get(satellite.noradId);

              return (
                <div
                  key={satellite.noradId}
                  className="p-4 hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => handleSatelliteClick(satellite)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{satellite.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                          {satellite.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">NORAD ID: {satellite.noradId}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(satellite.noradId);
                      }}
                      className="text-gray-400 hover:text-yellow-400 transition p-1"
                    >
                      <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>

                  {/* Position Data */}
                  {position && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {position.latitude.toFixed(2)}°, {position.longitude.toFixed(2)}°
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>{position.altitude.toFixed(0)} km</span>
                        </div>
                      </div>
                      {observerLocation && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Navigation className="w-3 h-3" />
                            <span>Az: {position.azimuth.toFixed(1)}°</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Activity className="w-3 h-3" />
                            <span>El: {position.elevation.toFixed(1)}°</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Updated: {new Date(position.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Loading Position */}
                  {isFavorite && !position && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader className="w-3 h-3 animate-spin" />
                        <span>Loading position...</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Auto-refresh: 10s</span>
          <span>
            {observerLocation
              ? `Observer: ${observerLocation.latitude.toFixed(2)}°, ${observerLocation.longitude.toFixed(2)}°`
              : 'No observer location'}
          </span>
        </div>
      </div>
    </div>
  );
}
