/**
 * Users API
 * Methods for user profile, preferences, and pin management
 */

import { apiClient } from './client';
import {
  UserProfile,
  UpdateProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  Pin,
  CreatePinRequest,
  UpdatePinRequest,
} from './types';

export class UsersAPI {
  // ============================================================================
  // Profile Management
  // ============================================================================

  /**
   * Get current user's profile
   */
  static async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/profile');
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/users/profile', data);
  }

  // ============================================================================
  // Preferences Management
  // ============================================================================

  /**
   * Get current user's preferences
   */
  static async getPreferences(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>('/users/preferences');
  }

  /**
   * Update current user's preferences
   */
  static async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    return apiClient.put<UserPreferences>('/users/preferences', data);
  }

  // ============================================================================
  // Pin Management
  // ============================================================================

  /**
   * Get all pins for current user
   */
  static async getPins(): Promise<Pin[]> {
    return apiClient.get<Pin[]>('/users/pins');
  }

  /**
   * Get a specific pin by ID
   */
  static async getPin(id: string): Promise<Pin> {
    return apiClient.get<Pin>(`/users/pins/${id}`);
  }

  /**
   * Create a new pin
   */
  static async createPin(data: CreatePinRequest): Promise<Pin> {
    return apiClient.post<Pin>('/users/pins', data);
  }

  /**
   * Update an existing pin
   */
  static async updatePin(id: string, data: UpdatePinRequest): Promise<Pin> {
    return apiClient.put<Pin>(`/users/pins/${id}`, data);
  }

  /**
   * Delete a pin
   */
  static async deletePin(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/pins/${id}`);
  }
}
