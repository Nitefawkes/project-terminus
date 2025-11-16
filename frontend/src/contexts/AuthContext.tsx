'use client';

/**
 * Authentication Context
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthAPI, User, APIException } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Auto-login on mount if tokens exist
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthAPI.isAuthenticated()) {
          const currentUser = AuthAPI.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token exists but no user data, try to fetch profile
            try {
              const { default: UsersAPI } = await import('@/lib/api/users');
              const profile = await UsersAPI.getProfile();
              setUser(profile);
            } catch (err) {
              // Failed to get profile, clear tokens
              AuthAPI.logout();
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthAPI.login({ email, password });
      setUser(response.user);
      router.push('/');
    } catch (err) {
      if (err instanceof APIException) {
        setError(err.errors.join(', '));
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthAPI.register({ email, password, name });
      setUser(response.user);
      router.push('/');
    } catch (err) {
      if (err instanceof APIException) {
        setError(err.errors.join(', '));
      } else {
        setError('Registration failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    AuthAPI.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
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
