'use client';

/**
 * Pin Management Component
 * Handles user pins on the map with backend integration and categories
 */

import { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePins } from '@/hooks/usePins';
import { useAuth } from '@/contexts/AuthContext';
import { initializePinsLayer, updatePins, cleanupPins } from '@/lib/map/pins';
import { PIN_CATEGORIES, getCategoryColor, DEFAULT_CATEGORY } from '@/lib/pin-categories';
import { MapPin, Plus, X, Filter, Edit2 } from 'lucide-react';

interface PinManagementProps {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

export function PinManagement({ map, isLoaded }: PinManagementProps) {
  const { isAuthenticated } = useAuth();
  const { pins, createPin, deletePin, updatePin, error, clearError } = usePins();
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [showPinPanel, setShowPinPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>('');

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

      // Show category selection dialog
      const categoryId = prompt(
        `Select category:\n${PIN_CATEGORIES.map((cat, i) => `${i + 1}. ${cat.name}`).join('\n')}\n\nEnter number (1-${PIN_CATEGORIES.length}) or press Enter for General:`
      );

      let selectedCat = DEFAULT_CATEGORY;
      if (categoryId) {
        const catIndex = parseInt(categoryId) - 1;
        if (catIndex >= 0 && catIndex < PIN_CATEGORIES.length) {
          selectedCat = PIN_CATEGORIES[catIndex].id;
        }
      }

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
        category: selectedCat,
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

  // Handle category edit
  const handleEditCategory = async (pinId: string) => {
    if (editCategory) {
      await updatePin(pinId, { category: editCategory });
    }
    setEditingPinId(null);
    setEditCategory('');
  };

  // Filter pins by category
  const filteredPins = selectedCategory
    ? pins.filter((pin) => pin.category === selectedCategory)
    : pins;

  // Get category counts
  const categoryCounts = pins.reduce((acc, pin) => {
    const cat = pin.category || DEFAULT_CATEGORY;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        <div className="absolute top-20 right-4 z-10 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-4 w-80 max-h-[600px] overflow-y-auto">
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

          {/* Category Filter */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">Filter by Category</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-2 py-1 text-xs rounded transition ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All ({pins.length})
              </button>
              {PIN_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] || 0;
                if (count === 0) return null;

                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                    }
                    className={`px-2 py-1 text-xs rounded transition flex items-center gap-1 ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pins List */}
          {filteredPins.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              {selectedCategory
                ? 'No pins in this category'
                : 'No pins yet. Click the + button to add one.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredPins.map((pin) => {
                const category = PIN_CATEGORIES.find((c) => c.id === pin.category);
                const CategoryIcon = category?.icon || MapPin;

                return (
                  <div
                    key={pin.id}
                    className="bg-gray-700/50 rounded p-2 hover:bg-gray-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex-1 cursor-pointer"
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
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(pin.category) }}
                          />
                          <p className="text-white text-sm font-medium">{pin.name}</p>
                        </div>
                        {pin.description && (
                          <p className="text-gray-400 text-xs mt-1">{pin.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryIcon className="w-3 h-3 text-gray-500" />
                          <p className="text-gray-500 text-xs">
                            {category?.name || 'General'}
                          </p>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {pin.latitude.toFixed(4)}°, {pin.longitude.toFixed(4)}°
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPinId(pin.id);
                            setEditCategory(pin.category || DEFAULT_CATEGORY);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="Edit category"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete pin "${pin.name}"?`)) {
                              deletePin(pin.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete pin"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Category Edit Mode */}
                    {editingPinId === pin.id && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <p className="text-gray-300 text-xs mb-2">Change Category:</p>
                        <div className="grid grid-cols-2 gap-1 mb-2">
                          {PIN_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setEditCategory(cat.id)}
                              className={`px-2 py-1 text-xs rounded transition flex items-center gap-1 ${
                                editCategory === cat.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              }`}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCategory(pin.id)}
                            className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingPinId(null);
                              setEditCategory('');
                            }}
                            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
