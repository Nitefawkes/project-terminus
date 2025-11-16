'use client';

/**
 * Pin Management Component
 * Handles user pins on the map with backend integration
 */

import { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePins } from '@/hooks/usePins';
import { useAuth } from '@/contexts/AuthContext';
import { initializePinsLayer, updatePins, cleanupPins } from '@/lib/map/pins';
import { MapPin, Plus, X } from 'lucide-react';

interface PinManagementProps {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

export function PinManagement({ map, isLoaded }: PinManagementProps) {
  const { isAuthenticated } = useAuth();
  const { pins, createPin, deletePin, error, clearError } = usePins();
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [showPinPanel, setShowPinPanel] = useState(false);

  // Initialize pins layer when map loads
  useEffect(() => {
    if (map && isLoaded) {
      initializePinsLayer(map);
    }
  }, [map, isLoaded]);

  // Update pins on map when pins data changes
  useEffect(() => {
    if (map && isLoaded && isAuthenticated) {
      updatePins(
        map,
        pins,
        (pin) => {
          console.log('Pin clicked:', pin);
        },
        async (id) => {
          if (confirm('Delete this pin?')) {
            await deletePin(id);
          }
        }
      );
    } else if (map && isLoaded && !isAuthenticated) {
      // Clear pins when logged out
      cleanupPins();
    }
  }, [map, isLoaded, pins, isAuthenticated, deletePin]);

  // Handle map click for adding pins
  useEffect(() => {
    if (!map || !isAddingPin) return;

    const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;

      // Prompt for pin name
      const name = prompt('Enter pin name:');
      if (!name) {
        setIsAddingPin(false);
        return;
      }

      const description = prompt('Enter description (optional):');

      await createPin({
        name,
        description: description || undefined,
        latitude: lat,
        longitude: lng,
      });

      setIsAddingPin(false);

      // Change cursor back
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = '';
      }
    };

    map.on('click', handleMapClick);

    // Change cursor to indicate pin mode
    if (map.getCanvas()) {
      map.getCanvas().style.cursor = 'crosshair';
    }

    return () => {
      map.off('click', handleMapClick);
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = '';
      }
    };
  }, [map, isAddingPin, createPin]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Pin Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Toggle Pin Panel */}
        <button
          onClick={() => setShowPinPanel(!showPinPanel)}
          className="bg-gray-800/90 hover:bg-gray-700/90 text-white p-3 rounded-lg shadow-lg transition backdrop-blur-sm border border-gray-700"
          title="Manage Pins"
        >
          <MapPin className="w-5 h-5" />
        </button>

        {/* Add Pin Button */}
        {showPinPanel && (
          <button
            onClick={() => setIsAddingPin(!isAddingPin)}
            className={`${
              isAddingPin
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-800/90 hover:bg-gray-700/90'
            } text-white p-3 rounded-lg shadow-lg transition backdrop-blur-sm border ${
              isAddingPin ? 'border-blue-500' : 'border-gray-700'
            }`}
            title={isAddingPin ? 'Cancel adding pin' : 'Add pin'}
          >
            {isAddingPin ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Pin Panel */}
      {showPinPanel && (
        <div className="absolute top-20 right-4 z-10 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-4 w-72 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              My Pins ({pins.length})
            </h3>
            <button
              onClick={() => setShowPinPanel(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-xs">
              {error}
              <button onClick={clearError} className="ml-2 underline">
                Dismiss
              </button>
            </div>
          )}

          {isAddingPin && (
            <div className="mb-3 p-2 bg-blue-900/50 border border-blue-500 rounded text-blue-200 text-xs">
              Click on the map to add a pin
            </div>
          )}

          {pins.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No pins yet. Click the + button to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  className="bg-gray-700/50 rounded p-2 hover:bg-gray-700 transition cursor-pointer"
                  onClick={() => {
                    if (map) {
                      map.flyTo({
                        center: [pin.longitude, pin.latitude],
                        zoom: 8,
                        duration: 1000,
                      });
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{pin.name}</p>
                      {pin.description && (
                        <p className="text-gray-400 text-xs mt-1">{pin.description}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {pin.latitude.toFixed(4)}°, {pin.longitude.toFixed(4)}°
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete pin "${pin.name}"?`)) {
                          deletePin(pin.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 transition ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
