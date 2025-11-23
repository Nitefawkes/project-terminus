import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserPreferences,
  Pin,
  UpdateUserRequest,
  UpdatePreferencesRequest,
  CreatePinRequest,
  ApiError,
} from './types';
import {
  RSSFeed,
  RSSItem,
  CreateFeedRequest,
  UpdateFeedRequest,
  FeedQuery,
  ItemQuery,
  MapItemsQuery,
  ItemsResponse,
} from './rss-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private refreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If error is 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // If already refreshing, wait for the new token
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.client.post<AuthResponse>('/auth/refresh', {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = response.data;
            this.setTokens(access_token, refresh_token);

            this.refreshing = false;
            this.onRefreshed(access_token);
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshing = false;
            this.refreshSubscribers = [];
            this.clearTokens();
            // Redirect to login or emit event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Authentication APIs
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    this.setTokens(response.data.access_token, response.data.refresh_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    this.setTokens(response.data.access_token, response.data.refresh_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  // User APIs
  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/users/profile');
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await this.client.put<User>('/users/profile', data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  // Preferences APIs
  async getPreferences(): Promise<UserPreferences> {
    const response = await this.client.get<UserPreferences>('/users/preferences');
    return response.data;
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const response = await this.client.put<UserPreferences>('/users/preferences', data);
    return response.data;
  }

  // Pins APIs
  async getPins(): Promise<Pin[]> {
    const response = await this.client.get<Pin[]>('/users/pins');
    return response.data;
  }

  async createPin(data: CreatePinRequest): Promise<Pin> {
    const response = await this.client.post<Pin>('/users/pins', data);
    return response.data;
  }

  async deletePin(id: string): Promise<void> {
    await this.client.delete(`/users/pins/${id}`);
  }

  // RSS Feed APIs
  async getFeeds(query?: FeedQuery): Promise<RSSFeed[]> {
    const response = await this.client.get<RSSFeed[]>('/rss/feeds', { params: query });
    return response.data;
  }

  async getFeed(id: string): Promise<RSSFeed> {
    const response = await this.client.get<RSSFeed>(`/rss/feeds/${id}`);
    return response.data;
  }

  async createFeed(data: CreateFeedRequest): Promise<RSSFeed> {
    const response = await this.client.post<RSSFeed>('/rss/feeds', data);
    return response.data;
  }

  async updateFeed(id: string, data: UpdateFeedRequest): Promise<RSSFeed> {
    const response = await this.client.put<RSSFeed>(`/rss/feeds/${id}`, data);
    return response.data;
  }

  async deleteFeed(id: string): Promise<void> {
    await this.client.delete(`/rss/feeds/${id}`);
  }

  async refreshFeed(id: string): Promise<{ message: string; newItems: number }> {
    const response = await this.client.post(`/rss/feeds/${id}/refresh`);
    return response.data;
  }

  async refreshAllFeeds(): Promise<{ message: string }> {
    const response = await this.client.post('/rss/feeds/refresh-all');
    return response.data;
  }

  // RSS Item APIs
  async getItems(query?: ItemQuery): Promise<ItemsResponse> {
    const response = await this.client.get<ItemsResponse>('/rss/items', { params: query });
    return response.data;
  }

  async getItem(id: string): Promise<RSSItem> {
    const response = await this.client.get<RSSItem>(`/rss/items/${id}`);
    return response.data;
  }

  async markItemAsRead(id: string, read: boolean): Promise<RSSItem> {
    const response = await this.client.put<RSSItem>(`/rss/items/${id}/read`, { read });
    return response.data;
  }

  async toggleItemStar(id: string): Promise<RSSItem> {
    const response = await this.client.put<RSSItem>(`/rss/items/${id}/star`);
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    await this.client.delete(`/rss/items/${id}`);
  }

  // RSS Map Data
  async getMapItems(query?: MapItemsQuery): Promise<RSSItem[]> {
    const response = await this.client.get<RSSItem[]>('/rss/map-items', { params: query });
    return response.data;
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
