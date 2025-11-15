'use client';

import React, { useEffect, useState } from 'react';
import { Satellite, Loader2, MapPin, Users } from 'lucide-react';
import { satelliteTracker } from '@/lib/space-weather/satellite';
import type { SatellitePosition, SatellitePass } from '@/lib/space-weather/satellite';
import { clsx } from 'clsx';

const SatellitePanel: React.FC = () => {
  const [issPosition, setIssPosition] = useState<SatellitePosition | null>(null);
  const [issPasses, setIssPasses] = useState<SatellitePass[]>([]);
  const [astronauts, setAstronauts] = useState<Array<{ name: string; craft: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    loadSatelliteData();
    getUserLocation();
    
    // Update ISS position every 10 seconds
    const interval = setInterval(loadSatelliteData, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadPasses();
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location not available:', error);
        }
      );
    }
  };

  const loadSatelliteData = async () => {
    try {
      setLoading(true);
      const [position, astros] = await Promise.all([
        satelliteTracker.getISSPosition(),
        satelliteTracker.getAstronauts(),
      ]);
      
      setIssPosition(position);
      setAstronauts(astros.filter(a => a.craft === 'ISS'));
    } catch (err) {
      console.error('Failed to load satellite data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPasses = async () => {
    if (!userLocation) return;
    
    try {
      const passes = await satelliteTracker.getISSPasses(
        userLocation.lat,
        userLocation.lon
      );
      setIssPasses(passes);
    } catch (err) {
      console.error('Failed to load passes:', err);
    }
  };

  const getTimeUntilPass = (pass: SatellitePass): string => {
    const now = new Date();
    const diff = pass.startTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading && !issPosition) {
    return (
      <div className="terminus-satellite-panel">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <Satellite className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            ISS Tracking
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="terminus-satellite-panel">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <Satellite className="w-5 h-5 text-green-400" />
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          ISS Tracking
        </h3>
      </div>

      {/* ISS Position */}
      {issPosition && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-white">{issPosition.name}</div>
            <div className={clsx(
              'flex items-center gap-1 text-xs px-2 py-1 rounded',
              issPosition.visible ? 'bg-yellow-900/30 text-yellow-300' : 'bg-gray-700/30 text-gray-400'
            )}>
              <div className={clsx(
                'w-2 h-2 rounded-full',
                issPosition.visible ? 'bg-yellow-400' : 'bg-gray-500'
              )}></div>
              {issPosition.visible ? 'Visible' : 'Eclipse'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Latitude</div>
              <div className="text-lg font-semibold text-green-300">
                {issPosition.latitude.toFixed(2)}°
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Longitude</div>
              <div className="text-lg font-semibold text-green-300">
                {issPosition.longitude.toFixed(2)}°
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Altitude</div>
              <div className="text-lg font-semibold text-green-300">
                {issPosition.altitude} km
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Velocity</div>
              <div className="text-lg font-semibold text-green-300">
                {issPosition.velocity.toFixed(2)} km/s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crew */}
      {astronauts.length > 0 && (
        <div className="pt-4 border-t border-gray-700/50 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Crew on ISS ({astronauts.length})
            </div>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {astronauts.map((astronaut, i) => (
              <div key={i} className="text-sm text-gray-300">
                • {astronaut.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Passes */}
      {userLocation && issPasses.length > 0 && (
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-purple-400" />
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Next Passes (Your Location)
            </div>
          </div>
          <div className="space-y-2">
            {issPasses.slice(0, 3).map((pass, i) => (
              <div
                key={i}
                className="bg-gray-800/50 rounded p-2 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-semibold">
                    {pass.startTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="text-purple-300">
                    in {getTimeUntilPass(pass)}
                  </span>
                </div>
                <div className="text-gray-400">
                  Duration: {Math.round((pass.endTime.getTime() - pass.startTime.getTime()) / 60000)} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!userLocation && (
        <div className="mt-4 p-2 bg-blue-900/20 rounded text-xs text-blue-300">
          ℹ️ Enable location to see pass predictions
        </div>
      )}

      {/* Update Time */}
      {issPosition && (
        <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
          Updated: {issPosition.timestamp.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default SatellitePanel;
