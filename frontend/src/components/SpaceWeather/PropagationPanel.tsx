'use client';

import React, { useEffect, useState } from 'react';
import { Radio, Loader2, Sun, Moon } from 'lucide-react';
import { spaceWeatherAPI } from '@/lib/space-weather/api';
import { PropagationForecast, getPropagationColor } from '@/lib/space-weather/types';
import { clsx } from 'clsx';

const PropagationPanel: React.FC = () => {
  const [forecast, setForecast] = useState<PropagationForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPropagation();
    
    // Update every 15 minutes
    const interval = setInterval(loadPropagation, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPropagation = async () => {
    try {
      setLoading(true);
      const data = await spaceWeatherAPI.getPropagationForecast();
      setForecast(data);
    } catch (err) {
      console.error('Failed to load propagation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && forecast.length === 0) {
    return (
      <div className="terminus-propagation-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <Radio className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            HF/VHF Propagation
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="terminus-propagation-panel">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <Radio className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          HF/VHF Propagation
        </h3>
      </div>

      {/* Band Conditions */}
      <div className="space-y-2">
        {forecast.map((band) => (
          <div
            key={band.band}
            className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-white">{band.band}</div>
              <div className="flex gap-2">
                {/* Day conditions */}
                <div className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-yellow-400" />
                  <span
                    className="text-xs font-medium uppercase px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${getPropagationColor(band.day)}20`,
                      color: getPropagationColor(band.day),
                    }}
                  >
                    {band.day}
                  </span>
                </div>
                {/* Night conditions */}
                <div className="flex items-center gap-1">
                  <Moon className="w-3 h-3 text-blue-300" />
                  <span
                    className="text-xs font-medium uppercase px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${getPropagationColor(band.night)}20`,
                      color: getPropagationColor(band.night),
                    }}
                  >
                    {band.night}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {band.conditions}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <div className="text-xs text-gray-400 mb-2">Conditions:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPropagationColor('excellent') }}></div>
            <span className="text-gray-400">Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPropagationColor('good') }}></div>
            <span className="text-gray-400">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPropagationColor('fair') }}></div>
            <span className="text-gray-400">Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPropagationColor('poor') }}></div>
            <span className="text-gray-400">Poor</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 p-2 bg-blue-900/20 rounded text-xs text-blue-300">
        ℹ️ Conditions based on current geomagnetic activity and solar wind
      </div>
    </div>
  );
};

export default PropagationPanel;
