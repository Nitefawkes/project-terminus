'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardAPI, DashboardData } from '@/lib/api/dashboard';
import {
  MapPin,
  Satellite,
  Map as MapIcon,
  User,
  Navigation,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  const loadDashboard = async () => {
    try {
      const data = await DashboardAPI.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {dashboard.user.name}</h1>
        <p className="text-gray-400">Your Project Terminus dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/"
          className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg hover:from-blue-500 hover:to-blue-700 transition"
        >
          <MapIcon className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-semibold mb-1">Open Map</h3>
          <p className="text-sm text-blue-100">View global intelligence dashboard</p>
        </Link>

        <Link
          href="/profile"
          className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg hover:from-purple-500 hover:to-purple-700 transition"
        >
          <User className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-semibold mb-1">Profile</h3>
          <p className="text-sm text-purple-100">Manage your account settings</p>
        </Link>

        <Link
          href="/?settings=true"
          className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg hover:from-green-500 hover:to-green-700 transition"
        >
          <Navigation className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-semibold mb-1">Settings</h3>
          <p className="text-sm text-green-100">Configure map preferences</p>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Location Pins</h3>
            <MapPin className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-4xl font-bold mb-2">{dashboard.stats.totalPins}</div>
          <p className="text-sm text-gray-400">Total pins created</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Favorite Satellites</h3>
            <Satellite className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-4xl font-bold mb-2">{dashboard.stats.favoriteSatellites}</div>
          <p className="text-sm text-gray-400">Satellites tracked</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Observer Location</h3>
            <Navigation className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-4xl font-bold mb-2">
            {dashboard.stats.hasObserverLocation ? '✓' : '–'}
          </div>
          <p className="text-sm text-gray-400">
            {dashboard.stats.hasObserverLocation
              ? dashboard.observerLocation.name || 'Location set'
              : 'Not configured'}
          </p>
        </div>
      </div>

      {/* Recent Pins */}
      {dashboard.recentPins.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recent Pins</h3>
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            {dashboard.recentPins.map((pin) => (
              <div
                key={pin.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium">{pin.name}</div>
                    <div className="text-sm text-gray-400">
                      {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {new Date(pin.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <div className="space-y-2">
            <Link
              href="/"
              className="block p-3 bg-gray-700/50 rounded hover:bg-gray-700 transition"
            >
              <div className="font-medium">Global Map View</div>
              <div className="text-sm text-gray-400">Open main intelligence dashboard</div>
            </Link>
            <Link
              href="/profile"
              className="block p-3 bg-gray-700/50 rounded hover:bg-gray-700 transition"
            >
              <div className="font-medium">Observer Location</div>
              <div className="text-sm text-gray-400">Set your location for satellite tracking</div>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Account Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-700/50 rounded">
              <span className="text-gray-400">Email</span>
              <span className="font-medium">{dashboard.user.email}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-700/50 rounded">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{dashboard.user.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
