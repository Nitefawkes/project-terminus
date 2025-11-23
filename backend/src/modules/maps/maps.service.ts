import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SatellitePosition, SatelliteTLE } from './interfaces/satellite.interface';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly celestrakBaseUrl = 'https://celestrak.org';
  private readonly n2yoBaseUrl = 'https://api.n2yo.com/rest/v1/satellite';
  private readonly openNotifyBaseUrl = 'http://api.open-notify.org';

  // In-memory cache for TLE data (valid for ~24 hours)
  private tleCache: Map<number, { tle: SatelliteTLE; timestamp: Date }> = new Map();
  private readonly tleCacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private configService: ConfigService) {}

  /**
   * Get ISS current position
   */
  async getISSPosition(): Promise<SatellitePosition> {
    try {
      const response = await axios.get(`${this.openNotifyBaseUrl}/iss-now.json`, {
        timeout: 5000,
      });

      if (!response.data || !response.data.iss_position) {
        throw new NotFoundException('ISS position data not available');
      }

      const position: SatellitePosition = {
        name: 'ISS (ZARYA)',
        noradId: 25544,
        latitude: parseFloat(response.data.iss_position.latitude),
        longitude: parseFloat(response.data.iss_position.longitude),
        altitude: 408, // Average ISS altitude
        azimuth: 0,
        elevation: 0,
        rightAscension: 0,
        declination: 0,
        timestamp: new Date(response.data.timestamp * 1000),
      };

      this.logger.debug(
        `ISS Position: ${position.latitude.toFixed(2)}, ${position.longitude.toFixed(2)}`,
      );

      return position;
    } catch (error) {
      this.logger.error(`Failed to fetch ISS position: ${error.message}`);
      throw new NotFoundException('Unable to fetch ISS position');
    }
  }

  /**
   * Get satellite TLE (Two-Line Element) data from Celestrak
   */
  async getSatelliteTLE(noradId: number): Promise<SatelliteTLE> {
    // Check cache first
    const cached = this.tleCache.get(noradId);
    if (cached && Date.now() - cached.timestamp.getTime() < this.tleCacheDuration) {
      this.logger.debug(`Using cached TLE for NORAD ${noradId}`);
      return cached.tle;
    }

    try {
      // Fetch from Celestrak GP (General Perturbations) data
      const response = await axios.get(
        `${this.celestrakBaseUrl}/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`,
        { timeout: 10000 },
      );

      const lines = response.data.trim().split('\n');

      if (lines.length < 3) {
        throw new NotFoundException(`TLE data not found for NORAD ${noradId}`);
      }

      const tle: SatelliteTLE = {
        name: lines[0].trim(),
        line1: lines[1].trim(),
        line2: lines[2].trim(),
      };

      // Cache the TLE
      this.tleCache.set(noradId, { tle, timestamp: new Date() });
      this.logger.log(`Fetched and cached TLE for ${tle.name} (${noradId})`);

      return tle;
    } catch (error) {
      this.logger.error(`Failed to fetch TLE for NORAD ${noradId}: ${error.message}`);
      throw new NotFoundException(`Unable to fetch TLE data for satellite ${noradId}`);
    }
  }

  /**
   * Get multiple satellite positions
   */
  async getSatellitePositions(noradIds: number[]): Promise<SatellitePosition[]> {
    const positions = await Promise.allSettled(
      noradIds.map(async (id) => {
        if (id === 25544) {
          return this.getISSPosition();
        }
        // For other satellites, would need TLE propagation library
        // For now, return null for non-ISS satellites
        return null;
      }),
    );

    return positions
      .filter((result) => result.status === 'fulfilled' && result.value !== null)
      .map((result: any) => result.value);
  }

  /**
   * Get ground track for a satellite
   * This is a simplified version - would need satellite.js or similar for full implementation
   */
  async getGroundTrack(
    noradId: number,
    duration: number = 90,
    step: number = 60,
  ): Promise<{ coordinates: Array<[number, number]>; timestamps: Date[] }> {
    // For ISS, we can use current position and simulate
    // For production, would use satellite.js with TLE data

    if (noradId === 25544) {
      const currentPos = await this.getISSPosition();
      const coordinates: Array<[number, number]> = [];
      const timestamps: Date[] = [];

      // Simplified ground track simulation
      const numPoints = Math.floor((duration * 60) / step);
      const baseTime = currentPos.timestamp.getTime();

      for (let i = 0; i < numPoints; i++) {
        const timeOffset = i * step * 1000;
        // ISS moves ~7.66 km/s, roughly 0.069 degrees per second
        const lonOffset = (i * step * 0.069) % 360;

        const lon = (currentPos.longitude + lonOffset) % 360;
        const lat = currentPos.latitude + Math.sin(i * 0.1) * 5; // Simple oscillation

        coordinates.push([lon > 180 ? lon - 360 : lon, Math.max(-90, Math.min(90, lat))]);
        timestamps.push(new Date(baseTime + timeOffset));
      }

      return { coordinates, timestamps };
    }

    throw new NotFoundException(`Ground track not available for satellite ${noradId}`);
  }

  /**
   * Get popular satellites list
   */
  getPopularSatellites(): Array<{ name: string; noradId: number; category: string }> {
    return [
      { name: 'ISS (ZARYA)', noradId: 25544, category: 'Space Stations' },
      { name: 'HUBBLE SPACE TELESCOPE', noradId: 20580, category: 'Scientific' },
      { name: 'TIANGONG', noradId: 48274, category: 'Space Stations' },
      { name: 'STARLINK-1007', noradId: 44713, category: 'Communication' },
      { name: 'NOAA 18', noradId: 28654, category: 'Weather' },
      { name: 'GOES 16', noradId: 41866, category: 'Weather' },
      { name: 'LANDSAT 9', noradId: 49260, category: 'Earth Resources' },
    ];
  }

  /**
   * Clear TLE cache (for maintenance)
   */
  clearTLECache(): void {
    this.tleCache.clear();
    this.logger.log('TLE cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry: Date | null } {
    let oldestEntry: Date | null = null;

    this.tleCache.forEach((value) => {
      if (!oldestEntry || value.timestamp < oldestEntry) {
        oldestEntry = value.timestamp;
      }
    });

    return {
      size: this.tleCache.size,
      oldestEntry,
    };
  }
}
