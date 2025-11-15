'use client';

import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Layers, Eye, EyeOff, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const LayerPanel: React.FC = () => {
  const { layers, layerStates, toggleLayer } = useAppStore();

  const layerList = Object.values(layers);

  if (layerList.length === 0) {
    return (
      <div className="terminus-layer-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Map Layers
          </h3>
        </div>
        <div className="text-sm text-gray-500 italic">
          Layers will appear here once initialized
        </div>
      </div>
    );
  }

  // Group layers by category
  const layersByCategory = layerList.reduce((acc, layer) => {
    const category = layer.category || 'custom';
    if (!acc[category]) acc[category] = [];
    acc[category].push(layer);
    return acc;
  }, {} as Record<string, typeof layerList>);

  return (
    <div className="terminus-layer-panel">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <Layers className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          Map Layers
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(layersByCategory).map(([category, categoryLayers]) => (
          <div key={category}>
            <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              {category}
            </h4>
            <div className="space-y-1">
              {categoryLayers.map((layer) => {
                const state = layerStates[layer.id];
                const isLoading = state?.loading;
                const hasError = state?.error;

                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all',
                      'hover:bg-gray-700/50',
                      layer.enabled ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : layer.enabled ? (
                        <Eye className="w-4 h-4 text-blue-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="text-left flex-1">
                        <div className={clsx(
                          'text-sm font-medium',
                          layer.enabled ? 'text-white' : 'text-gray-400'
                        )}>
                          {layer.name}
                        </div>
                        {hasError && (
                          <div className="text-xs text-red-400 mt-0.5">
                            Failed to load
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Attribution footer */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <div className="text-xs text-gray-500">
          Layer data sources attributed on map
        </div>
      </div>
    </div>
  );
};

export default LayerPanel;
