'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/login"
          className="px-4 py-2 text-sm text-white hover:text-blue-400 transition"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-md transition"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-white hidden md:inline">{user.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Open profile modal or navigate to profile page
                }}
                className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
