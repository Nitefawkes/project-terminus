import { APIClient } from './client';

export interface SatellitePosition {
  name: string;
  noradId: number;
  latitude: number;
  longitude: number;
  altitude: number;
  azimuth: number;
  elevation: number;
  rightAscension: number;
  declination: number;
  timestamp: Date;
}

export interface SatelliteTLE {
  name: string;
  line1: string;
  line2: string;
}

export interface GroundTrack {
  coordinates: Array<[number, number]>;
  timestamps: Date[];
  noradId: number;
  duration: number;
}

export interface PopularSatellite {
  name: string;
  noradId: number;
  category: string;
}

export class MapsAPI {
  private static client = new APIClient();

  /**
   * Get current ISS position
   */
  static async getISSPosition(): Promise<SatellitePosition> {
    return this.client.get<SatellitePosition>('/maps/satellites/iss');
  }

  /**
   * Get satellite TLE data
   */
  static async getSatelliteTLE(noradId: number): Promise<SatelliteTLE> {
    return this.client.get<SatelliteTLE>(`/maps/satellites/tle?noradId=${noradId}`);
  }

  /**
   * Get satellite ground track
   */
  static async getGroundTrack(
    noradId: number,
    duration: number = 90,
    step: number = 60
  ): Promise<GroundTrack> {
    return this.client.get<GroundTrack>(
      `/maps/satellites/ground-track?noradId=${noradId}&duration=${duration}&step=${step}`
    );
  }

  /**
   * Get list of popular satellites
   */
  static async getPopularSatellites(): Promise<PopularSatellite[]> {
    return this.client.get<PopularSatellite[]>('/maps/satellites/popular');
  }

  /**
   * Get positions for multiple satellites
   */
  static async getSatellitePositions(noradIds: number[]): Promise<SatellitePosition[]> {
    return this.client.get<SatellitePosition[]>(
      `/maps/satellites/positions?noradIds=${noradIds.join(',')}`
    );
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{ size: number; oldestEntry: Date | null }> {
    return this.client.get('/maps/cache/stats');
  }
}
