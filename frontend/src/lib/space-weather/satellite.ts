/**
 * Satellite Tracking for ISS and other satellites
 * Using simplified orbital calculations
 */

export interface SatellitePosition {
  name: string;
  noradId: number;
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/s
  timestamp: Date;
  visible: boolean; // Is it currently visible (in sunlight)
}

export interface SatellitePass {
  startTime: Date;
  endTime: Date;
  maxElevation: number;
  direction: string; // e.g., "N to SE"
}

/**
 * Simple ISS tracker using Open-Notify API (free, no key needed)
 */
class SatelliteTracker {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 1000; // 10 seconds for real-time tracking

  /**
   * Get current ISS position
   */
  async getISSPosition(): Promise<SatellitePosition | null> {
    try {
      const cached = this.getCache('iss-position');
      if (cached) return cached;

      const response = await fetch('http://api.open-notify.org/iss-now.json');
      if (!response.ok) throw new Error('Failed to fetch ISS position');

      const data = await response.json();
      
      if (data.message !== 'success') {
        throw new Error('Invalid API response');
      }

      const position: SatellitePosition = {
        name: 'ISS (ZARYA)',
        noradId: 25544,
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        altitude: 408, // ISS average altitude
        velocity: 7.66, // ISS average velocity
        timestamp: new Date(data.timestamp * 1000),
        visible: this.isInSunlight(
          parseFloat(data.iss_position.latitude),
          parseFloat(data.iss_position.longitude)
        ),
      };

      this.setCache('iss-position', position);
      return position;
    } catch (error) {
      console.error('Failed to fetch ISS position:', error);
      return null;
    }
  }

  /**
   * Get upcoming ISS passes for a location
   */
  async getISSPasses(lat: number, lon: number, altitude: number = 0): Promise<SatellitePass[]> {
    try {
      const cached = this.getCache(`iss-passes-${lat}-${lon}`);
      if (cached) return cached;

      // Using Open-Notify API for pass predictions
      const response = await fetch(
        `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&alt=${altitude}&n=5`
      );
      
      if (!response.ok) throw new Error('Failed to fetch ISS passes');

      const data = await response.json();
      
      if (data.message !== 'success') {
        throw new Error('Invalid API response');
      }

      const passes: SatellitePass[] = data.response.map((pass: any) => ({
        startTime: new Date(pass.risetime * 1000),
        endTime: new Date((pass.risetime + pass.duration) * 1000),
        maxElevation: 45, // Approximate, API doesn't provide this
        direction: 'Varies',
      }));

      this.setCache(`iss-passes-${lat}-${lon}`, passes);
      return passes;
    } catch (error) {
      console.error('Failed to fetch ISS passes:', error);
      return [];
    }
  }

  /**
   * Calculate orbital path (ground track) for ISS
   * Returns coordinates for the next orbit
   */
  async getISSGroundTrack(): Promise<Array<{ lat: number; lng: number }>> {
    try {
      const position = await this.getISSPosition();
      if (!position) return [];

      const track: Array<{ lat: number; lng: number }> = [];
      
      // ISS orbital period is ~92 minutes
      // We'll generate points for the next hour
      const points = 60;
      const orbitalPeriod = 92 * 60; // seconds
      const degreesPerSecond = 360 / orbitalPeriod;
      const secondsPerPoint = 60;

      for (let i = 0; i < points; i++) {
        const lng = (position.longitude + (degreesPerSecond * secondsPerPoint * i)) % 360;
        const adjustedLng = lng > 180 ? lng - 360 : lng;
        
        // Simplified: keep similar latitude pattern
        // Real calculation would need orbital mechanics
        const latVariation = Math.sin((i / points) * 2 * Math.PI) * 51.6; // ISS max latitude
        
        track.push({
          lat: latVariation,
          lng: adjustedLng,
        });
      }

      return track;
    } catch (error) {
      console.error('Failed to calculate ground track:', error);
      return [];
    }
  }

  /**
   * Check if position is in sunlight
   */
  private isInSunlight(lat: number, lng: number): boolean {
    // Simple check using current time and approximate solar position
    const now = new Date();
    const hours = now.getUTCHours();
    const solarLng = (hours - 12) * 15; // Approximate solar longitude
    
    // If satellite longitude is within ~90 degrees of solar longitude, it's in daylight
    const diff = Math.abs(lng - solarLng);
    return diff < 90 || diff > 270;
  }

  /**
   * Get astronauts currently in space
   */
  async getAstronauts(): Promise<Array<{ name: string; craft: string }>> {
    try {
      const cached = this.getCache('astronauts');
      if (cached) return cached;

      const response = await fetch('http://api.open-notify.org/astros.json');
      if (!response.ok) throw new Error('Failed to fetch astronauts');

      const data = await response.json();
      
      const astronauts = data.people || [];
      this.setCache('astronauts', astronauts);
      
      return astronauts;
    } catch (error) {
      console.error('Failed to fetch astronauts:', error);
      return [];
    }
  }

  /**
   * Cache helpers
   */
  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const satelliteTracker = new SatelliteTracker();
