'use client';

import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Wind, Radio, Loader2 } from 'lucide-react';
import { spaceWeatherAPI } from '@/lib/space-weather/api';
import { SpaceWeatherData, getKpStatus } from '@/lib/space-weather/types';
import { clsx } from 'clsx';

const SpaceWeatherPanel: React.FC = () => {
  const [data, setData] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpaceWeather();
    
    // Update every 5 minutes
    const interval = setInterval(loadSpaceWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSpaceWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await spaceWeatherAPI.getAllData();
      setData(weatherData);
      setError(null);
    } catch (err) {
      setError('Failed to load space weather data');
      console.error('Space weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="terminus-space-weather-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Space Weather
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="terminus-space-weather-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Space Weather
          </h3>
        </div>
        <div className="text-sm text-red-400">
          {error || 'No data available'}
        </div>
      </div>
    );
  }

  const kpStatus = data.kpIndex ? getKpStatus(data.kpIndex.kp) : null;

  return (
    <div className="terminus-space-weather-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Space Weather
          </h3>
        </div>
        <div className="text-xs text-gray-500">
          Live
        </div>
      </div>

      {/* Kp Index */}
      {data.kpIndex && kpStatus && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Geomagnetic Activity
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold" style={{ color: kpStatus.color }}>
                Kp {data.kpIndex.kp.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1 capitalize">
                {kpStatus.level}
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${kpStatus.color}20`, borderColor: kpStatus.color, borderWidth: 2 }}
            >
              <Radio className="w-8 h-8" style={{ color: kpStatus.color }} />
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {kpStatus.description}
          </div>
        </div>
      )}

      {/* Solar Wind */}
      {data.solarWind && (
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-4 h-4 text-cyan-400" />
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Solar Wind
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Speed</div>
              <div className="text-lg font-semibold text-cyan-300">
                {Math.round(data.solarWind.speed)} km/s
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Density</div>
              <div className="text-lg font-semibold text-cyan-300">
                {data.solarWind.density.toFixed(1)} p/cm³
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Bz</div>
              <div className={clsx(
                'text-lg font-semibold',
                data.solarWind.bz < 0 ? 'text-red-400' : 'text-green-400'
              )}>
                {data.solarWind.bz.toFixed(1)} nT
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Temp</div>
              <div className="text-lg font-semibold text-cyan-300">
                {(data.solarWind.temperature / 1000).toFixed(0)}K K
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {data.solarWind.bz < -5 && (
              <span className="text-yellow-400">⚠ Southward Bz may enhance aurora</span>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Active Alerts ({data.alerts.length})
            </div>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {data.alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'p-2 rounded text-xs',
                  alert.severity === 'extreme' && 'bg-red-900/30 border border-red-500/50',
                  alert.severity === 'severe' && 'bg-orange-900/30 border border-orange-500/50',
                  (alert.severity === 'moderate' || alert.severity === 'strong') &&
                    'bg-yellow-900/30 border border-yellow-500/50',
                  alert.severity === 'minor' && 'bg-blue-900/30 border border-blue-500/50'
                )}
              >
                <div className="font-semibold capitalize mb-1">
                  {alert.type.replace(/_/g, ' ')}
                </div>
                <div className="text-gray-300 line-clamp-2">
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
        Updated: {new Date(data.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SpaceWeatherPanel;
