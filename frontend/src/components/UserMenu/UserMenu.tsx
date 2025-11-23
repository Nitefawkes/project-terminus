'use client';

/**
 * User Menu Component
 * Shows user info with dropdown for profile, settings, logout
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, ChevronDown, LogIn, UserPlus } from 'lucide-react';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfile = () => {
    router.push('/profile');
    setIsOpen(false);
  };

  const handleLogin = () => {
    router.push('/login');
    setIsOpen(false);
  };

  const handleRegister = () => {
    router.push('/register');
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Login
        </button>
        <button
          onClick={handleRegister}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Register
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition backdrop-blur-sm border border-gray-700"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium">{user?.name || 'User'}</div>
          <div className="text-xs text-gray-400">{user?.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-700 md:hidden">
            <div className="font-medium text-white">{user?.name}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition flex items-center gap-3"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => {
                router.push('/?settings=true');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-700 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
