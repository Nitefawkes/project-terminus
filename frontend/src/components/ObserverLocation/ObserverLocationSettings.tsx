'use client';

import { useState, useEffect } from 'react';
import { DashboardAPI, ObserverLocation } from '@/lib/api/dashboard';
import { Navigation, MapPin, Save, Loader, CheckCircle, XCircle } from 'lucide-react';

export function ObserverLocationSettings() {
  const [location, setLocation] = useState<ObserverLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    altitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const loc = await DashboardAPI.getObserverLocation();
      if (loc) {
        setLocation(loc);
        setFormData({
          name: loc.name || '',
          latitude: loc.latitude.toString(),
          longitude: loc.longitude.toString(),
          altitude: loc.altitude?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Failed to load observer location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          altitude: position.coords.altitude?.toFixed(0) || '',
        }));
        setGettingLocation(false);
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`);
        setGettingLocation(false);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setSaving(true);

    try {
      await DashboardAPI.setObserverLocation({
        name: formData.name || undefined,
        latitude: lat,
        longitude: lng,
        altitude: formData.altitude ? parseInt(formData.altitude) : undefined,
      });

      setSuccess(true);
      await loadLocation();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save observer location');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Navigation className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-semibold">Observer Location</h2>
      </div>

      <p className="text-gray-400 mb-6">
        Set your observer location for accurate satellite pass predictions and aurora visibility calculations.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Location Name (optional)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Home, Office"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Latitude <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              placeholder="40.7128"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
            />
            <p className="text-xs text-gray-500 mt-1">-90 to 90</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Longitude <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              placeholder="-74.0060"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
            />
            <p className="text-xs text-gray-500 mt-1">-180 to 180</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Altitude (meters, optional)</label>
          <input
            type="number"
            value={formData.altitude}
            onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
            placeholder="10"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gettingLocation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
        >
          {gettingLocation ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          Use Current Location
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500 rounded text-red-200">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-500 rounded text-green-200">
            <CheckCircle className="w-5 h-5" />
            Observer location saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Observer Location
        </button>
      </form>

      {location && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded border border-gray-600">
          <div className="text-sm text-gray-400 mb-2">Current Location</div>
          <div className="font-medium">
            {location.name || 'Unnamed Location'}
          </div>
          <div className="text-sm text-gray-300 mt-1">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            {location.altitude && ` @ ${location.altitude}m`}
          </div>
        </div>
      )}
    </div>
  );
}
