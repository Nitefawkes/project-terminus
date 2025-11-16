/**
 * Authentication API
 * Methods for user registration, login, and token management
 */

import { apiClient } from './client';
import { TokenStorage } from './token-storage';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types';

export class AuthAPI {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Store tokens and user data
    TokenStorage.setTokens(response.access_token, response.refresh_token);
    TokenStorage.setUser(response.user);

    return response;
  }

  /**
   * Login existing user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);

    // Store tokens and user data
    TokenStorage.setTokens(response.access_token, response.refresh_token);
    TokenStorage.setUser(response.user);

    return response;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', data);

    // Update access token
    TokenStorage.setAccessToken(response.access_token);

    return response;
  }

  /**
   * Logout user
   */
  static logout(): void {
    TokenStorage.clear();

    // Redirect to home or login page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenStorage.isAuthenticated();
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): any | null {
    return TokenStorage.getUser();
  }
}
