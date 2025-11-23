/**
 * API Module Exports
 * Convenient exports for all API functionality
 */

// Core client
export { apiClient } from './client';

// API classes
export { AuthAPI } from './auth';
export { UsersAPI } from './users';
export { MapsAPI } from './maps';
export { DashboardAPI } from './dashboard';

// Utilities
export { TokenStorage } from './token-storage';

// Types
export * from './types';

// Re-export commonly used functions for convenience
export const api = {
  auth: {
    register: AuthAPI.register.bind(AuthAPI),
    login: AuthAPI.login.bind(AuthAPI),
    logout: AuthAPI.logout.bind(AuthAPI),
    refreshToken: AuthAPI.refreshToken.bind(AuthAPI),
    isAuthenticated: AuthAPI.isAuthenticated.bind(AuthAPI),
    getCurrentUser: AuthAPI.getCurrentUser.bind(AuthAPI),
  },
  users: {
    getProfile: UsersAPI.getProfile.bind(UsersAPI),
    updateProfile: UsersAPI.updateProfile.bind(UsersAPI),
    getPreferences: UsersAPI.getPreferences.bind(UsersAPI),
    updatePreferences: UsersAPI.updatePreferences.bind(UsersAPI),
    getPins: UsersAPI.getPins.bind(UsersAPI),
    getPin: UsersAPI.getPin.bind(UsersAPI),
    createPin: UsersAPI.createPin.bind(UsersAPI),
    updatePin: UsersAPI.updatePin.bind(UsersAPI),
    deletePin: UsersAPI.deletePin.bind(UsersAPI),
  },
};
