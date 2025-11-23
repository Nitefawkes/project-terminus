/**
 * API Types for Project Terminus
 * Type definitions for API requests and responses
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UserProfile extends User {
  preferences?: UserPreferences;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

// ============================================================================
// User Preferences Types
// ============================================================================

export interface UserPreferences {
  id: string;
  userId: string;
  mapStyle: 'streets' | 'satellite' | 'dark' | 'light';
  defaultZoom: number;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  enabledLayers: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePreferencesRequest {
  mapStyle?: 'streets' | 'satellite' | 'dark' | 'light';
  defaultZoom?: number;
  defaultCenter?: {
    lat: number;
    lng: number;
  };
  enabledLayers?: string[];
}

// ============================================================================
// Pin Types
// ============================================================================

export interface Pin {
  id: string;
  userId: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePinRequest {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
}

export interface UpdatePinRequest {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface APIError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class APIException extends Error {
  statusCode: number;
  errors: string[];

  constructor(statusCode: number, message: string | string[]) {
    const messages = Array.isArray(message) ? message : [message];
    super(messages.join(', '));
    this.name = 'APIException';
    this.statusCode = statusCode;
    this.errors = messages;
  }
}

// ============================================================================
// Response Wrappers
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
