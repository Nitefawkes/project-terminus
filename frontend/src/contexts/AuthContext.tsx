'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';
import { User, LoginRequest, RegisterRequest } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = apiClient.getCurrentUser();
        if (storedUser && apiClient.isAuthenticated()) {
          // Verify token is still valid by fetching profile
          const profile = await apiClient.getProfile();
          setUser(profile);
        }
      } catch (err) {
        // Token expired or invalid, clear auth state
        await apiClient.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for logout events (from token refresh failure)
    const handleLogout = () => {
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout);
      return () => window.removeEventListener('auth:logout', handleLogout);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.login(credentials);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.register(data);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
