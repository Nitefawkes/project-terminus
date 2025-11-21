// API Type Definitions

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  isActive: boolean;
  isVerified: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  mapStyle: string;
  defaultZoom: number;
  defaultCenter: { lat: number; lng: number } | null;
  enabledLayers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pin {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UpdatePreferencesRequest {
  mapStyle?: string;
  defaultZoom?: number;
  defaultCenter?: { lat: number; lng: number };
  enabledLayers?: string[];
}

export interface CreatePinRequest {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
