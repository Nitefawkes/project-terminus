import { APIClient } from './client';

export interface DashboardData {
  user: {
    name: string;
    email: string;
  };
  stats: {
    totalPins: number;
    favoriteSatellites: number;
    hasObserverLocation: boolean;
  };
  recentPins: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    category?: string;
    createdAt: string;
  }>;
  observerLocation: {
    name: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export interface ObserverLocation {
  name?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
}

export class DashboardAPI {
  private static client = new APIClient();

  static async getDashboard(): Promise<DashboardData> {
    return this.client.get<DashboardData>('/users/dashboard');
  }

  static async getObserverLocation(): Promise<ObserverLocation | null> {
    const result = await this.client.get<ObserverLocation>('/users/observer-location');
    if (!result.latitude || !result.longitude) {
      return null;
    }
    return result;
  }

  static async setObserverLocation(location: ObserverLocation): Promise<void> {
    await this.client.put('/users/observer-location', location);
  }

  static async addFavoriteSatellite(noradId: number): Promise<void> {
    await this.client.post(`/users/favorites/satellites/${noradId}`);
  }

  static async removeFavoriteSatellite(noradId: number): Promise<void> {
    await this.client.delete(`/users/favorites/satellites/${noradId}`);
  }

  static async getFavoriteSatellites(): Promise<number[]> {
    return this.client.get<number[]>('/users/favorites/satellites');
  }
}
