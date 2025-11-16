/**
 * Token Storage Utility
 * Handles secure storage and retrieval of JWT tokens
 */

const ACCESS_TOKEN_KEY = 'terminus_access_token';
const REFRESH_TOKEN_KEY = 'terminus_refresh_token';
const USER_KEY = 'terminus_user';

export class TokenStorage {
  /**
   * Check if we're running in a browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Store access token
   */
  static setAccessToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Store refresh token
   */
  static setRefreshToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store both tokens
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Store user data
   */
  static setUser(user: any): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  static getUser(): any | null {
    if (!this.isBrowser()) return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Clear all stored tokens and user data
   */
  static clear(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user is authenticated (has access token)
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
