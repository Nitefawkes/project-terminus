'use client';

/**
 * Settings Panel
 * Map customization and user preferences
 */

import { useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import { useAppStore } from '@/store/appStore';
import { X, Save, Check, Map as MapIcon, Layers } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
  map?: any;
}

export function SettingsPanel({ onClose, map }: SettingsPanelProps) {
  const { preferences, updatePreferences, saveMapState, isSyncing } = usePreferences();
  const { mapStyle, setMapStyle, layers, toggleLayer } = useAppStore();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveMapView = async () => {
    setError(null);
    setSuccess(false);

    if (!map) {
      setError('Map not available');
      return;
    }

    const result = await saveMapState(map);
    if (result) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('Failed to save map view');
    }
  };

  const handleMapStyleChange = async (style: string) => {
    setError(null);
    setMapStyle(style as any);

    const result = await updatePreferences({
      mapStyle: style as any,
    });

    if (!result) {
      setError('Failed to save map style');
    }
  };

  const handleToggleLayer = async (layerId: string) => {
    toggleLayer(layerId);

    // Save enabled layers
    const enabledLayers = Object.entries(layers)
      .filter(([_, layer]) => layer.enabled)
      .map(([id, _]) => id);

    await updatePreferences({
      enabledLayers,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapIcon className="w-6 h-6" />
            Map Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              Settings saved successfully
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Map Style */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Map Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {['streets', 'satellite', 'dark', 'light'].map((style) => (
                <button
                  key={style}
                  onClick={() => handleMapStyleChange(style)}
                  disabled={isSyncing}
                  className={`p-4 rounded-lg border-2 transition ${
                    mapStyle === style
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-white font-medium capitalize">{style}</div>
                  {mapStyle === style && (
                    <div className="text-blue-400 text-xs mt-1">Active</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Map Layers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {Object.entries(layers).map(([id, layer]) => (
                <label
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                >
                  <div>
                    <div className="text-white font-medium">{layer.name}</div>
                    {layer.description && (
                      <div className="text-gray-400 text-sm">{layer.description}</div>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={layer.enabled}
                    onChange={() => handleToggleLayer(id)}
                    className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Save Current View */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Default View</h3>
            <p className="text-gray-400 text-sm mb-3">
              Save your current map position and zoom level as the default view
            </p>
            <button
              onClick={handleSaveMapView}
              disabled={isSyncing || !map}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Current View
                </>
              )}
            </button>
            {preferences?.defaultCenter && (
              <div className="mt-2 text-xs text-gray-400">
                Current default: {preferences.defaultCenter.lat.toFixed(2)}°, {preferences.defaultCenter.lng.toFixed(2)}° @ zoom {preferences.defaultZoom?.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
