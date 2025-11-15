/**
 * NOAA Space Weather Prediction Center API Client
 * Free, public APIs for space weather data
 */

import {
  SpaceWeatherData,
  KpIndex,
  SolarWind,
  AuroraOval,
  SolarActivity,
  PropagationForecast,
  SpaceWeatherAlert,
} from './types';

const NOAA_BASE = 'https://services.swpc.noaa.gov';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class SpaceWeatherAPI {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Get current Kp index
   */
  async getKpIndex(): Promise<KpIndex | null> {
    try {
      const cached = this.getCache('kp-index');
      if (cached) return cached;

      const response = await fetch(`${NOAA_BASE}/json/planetary_k_index_1m.json`);
      if (!response.ok) throw new Error('Failed to fetch Kp index');

      const data = await response.json();
      
      // Get most recent reading
      const latest = data[data.length - 1];
      if (!latest) return null;

      const kpData: KpIndex = {
        time: latest.time_tag,
        kp: parseFloat(latest.kp_index),
        observedTime: new Date(latest.time_tag),
      };

      this.setCache('kp-index', kpData);
      return kpData;
    } catch (error) {
      console.error('Failed to fetch Kp index:', error);
      return null;
    }
  }

  /**
   * Get real-time solar wind data
   */
  async getSolarWind(): Promise<SolarWind | null> {
    try {
      const cached = this.getCache('solar-wind');
      if (cached) return cached;

      const response = await fetch(`${NOAA_BASE}/json/rtsw/rtsw_mag_1m.json`);
      if (!response.ok) throw new Error('Failed to fetch solar wind');

      const data = await response.json();
      const latest = data[data.length - 1];
      if (!latest) return null;

      const solarWind: SolarWind = {
        time: latest.time_tag,
        speed: parseFloat(latest.speed) || 0,
        density: parseFloat(latest.density) || 0,
        temperature: parseFloat(latest.temperature) || 0,
        bz: parseFloat(latest.bz_gsm) || 0,
        bt: parseFloat(latest.bt) || 0,
        observedTime: new Date(latest.time_tag),
      };

      this.setCache('solar-wind', solarWind);
      return solarWind;
    } catch (error) {
      console.error('Failed to fetch solar wind:', error);
      return null;
    }
  }

  /**
   * Get aurora oval prediction
   * Using simplified model based on Kp index
   */
  async getAuroraOval(): Promise<AuroraOval | null> {
    try {
      const kpIndex = await this.getKpIndex();
      if (!kpIndex) return null;

      // Aurora oval extends further south with higher Kp
      // Approximate latitude based on Kp index
      const baseLatitude = 67 - (kpIndex.kp * 2); // Simplified model

      // Generate points for aurora oval (northern hemisphere)
      const coordinates: Array<{ lat: number; lng: number }> = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        // Add some variation to make it look more natural
        const latVariation = Math.sin((lng * Math.PI) / 180) * 3;
        coordinates.push({
          lat: baseLatitude + latVariation,
          lng: lng,
        });
      }

      const auroraData: AuroraOval = {
        hemisphere: 'north',
        coordinates,
        intensity: kpIndex.kp,
        timestamp: kpIndex.observedTime,
      };

      return auroraData;
    } catch (error) {
      console.error('Failed to generate aurora oval:', error);
      return null;
    }
  }

  /**
   * Get HF propagation forecast
   * Simplified model based on solar activity
   */
  async getPropagationForecast(): Promise<PropagationForecast[]> {
    try {
      const cached = this.getCache('propagation');
      if (cached) return cached;

      const kpIndex = await this.getKpIndex();
      const solarWind = await this.getSolarWind();

      // Simplified propagation model
      // Good conditions: Low Kp, moderate solar wind
      // Poor conditions: High Kp, high solar wind speed
      
      const conditions = this.calculateConditions(kpIndex?.kp || 2, solarWind?.speed || 400);

      const forecast: PropagationForecast[] = [
        {
          band: '160m',
          day: 'poor',
          night: conditions.lowBands,
          conditions: 'Best at night, absorption during day',
        },
        {
          band: '80m',
          day: 'fair',
          night: conditions.lowBands,
          conditions: 'Primarily nighttime band',
        },
        {
          band: '40m',
          day: conditions.midBands,
          night: conditions.midBands,
          conditions: 'Good 24-hour propagation',
        },
        {
          band: '20m',
          day: conditions.midBands,
          night: conditions.midBands,
          conditions: 'Excellent DX band, day and night',
        },
        {
          band: '15m',
          day: conditions.highBands,
          night: 'poor',
          conditions: 'Daytime band, depends on solar activity',
        },
        {
          band: '10m',
          day: conditions.highBands,
          night: 'poor',
          conditions: 'Requires good solar conditions',
        },
        {
          band: '6m',
          day: conditions.vhf,
          night: conditions.vhf,
          conditions: 'Sporadic E, aurora, and meteor scatter',
        },
        {
          band: '2m',
          day: 'good',
          night: 'good',
          conditions: 'Line of sight, tropospheric ducting',
        },
      ];

      this.setCache('propagation', forecast);
      return forecast;
    } catch (error) {
      console.error('Failed to get propagation forecast:', error);
      return [];
    }
  }

  /**
   * Calculate band conditions based on space weather
   */
  private calculateConditions(kp: number, solarWindSpeed: number): {
    lowBands: 'poor' | 'fair' | 'good' | 'excellent';
    midBands: 'poor' | 'fair' | 'good' | 'excellent';
    highBands: 'poor' | 'fair' | 'good' | 'excellent';
    vhf: 'poor' | 'fair' | 'good' | 'excellent';
  } {
    // High Kp = geomagnetic storm = poor HF conditions
    // High solar wind = potential disturbances
    
    const stormLevel = kp >= 5 ? 2 : kp >= 4 ? 1 : 0;
    const windLevel = solarWindSpeed > 600 ? 2 : solarWindSpeed > 500 ? 1 : 0;
    const disturbance = stormLevel + windLevel;

    const conditionLevels = ['excellent', 'good', 'fair', 'poor'] as const;

    return {
      lowBands: conditionLevels[Math.min(disturbance, 3)],
      midBands: conditionLevels[Math.min(disturbance, 3)],
      highBands: conditionLevels[Math.min(disturbance + 1, 3)], // More affected
      vhf: kp >= 5 ? 'excellent' : 'good', // VHF benefits from auroral propagation
    };
  }

  /**
   * Get solar activity data (X-ray flux, flares, proton flux)
   */
  async getSolarActivity(): Promise<SolarActivity | null> {
    try {
      const cached = this.getCache('solar-activity');
      if (cached) return cached;

      // Fetch X-ray flux and proton flux data in parallel
      const [xrayResponse, protonResponse] = await Promise.all([
        fetch(`${NOAA_BASE}/json/goes/primary/xrays-6-hour.json`),
        fetch(`${NOAA_BASE}/json/goes/primary/integral-protons-plot-6-hour.json`),
      ]);

      if (!xrayResponse.ok) throw new Error('Failed to fetch X-ray data');

      const xrayData = await xrayResponse.json();
      const protonData = protonResponse.ok ? await protonResponse.json() : null;

      // Get most recent X-ray flux readings
      const latestXray = xrayData[xrayData.length - 1];
      if (!latestXray) return null;

      const shortWave = parseFloat(latestXray.flux) || 1e-9;
      const longWave = parseFloat(latestXray.flux) || 1e-9; // NOAA typically provides combined flux

      // Determine X-ray class based on flux level
      const xrayClass = this.determineXrayClass(shortWave);

      // Extract recent solar flares from X-ray data (spike detection)
      const solarFlares = this.detectFlares(xrayData);

      // Get most recent proton flux
      let protonFlux = 1.0; // Default baseline
      if (protonData && protonData.length > 0) {
        const latestProton = protonData[protonData.length - 1];
        protonFlux = parseFloat(latestProton.flux) || 1.0;
      }

      const solarActivity: SolarActivity = {
        xrayFlux: {
          shortWave,
          longWave,
          class: xrayClass,
        },
        solarFlares,
        protonFlux,
      };

      this.setCache('solar-activity', solarActivity);
      return solarActivity;
    } catch (error) {
      console.error('Failed to fetch solar activity:', error);
      return null;
    }
  }

  /**
   * Determine X-ray classification from flux level
   * A: < 1e-7, B: < 1e-6, C: < 1e-5, M: < 1e-4, X: >= 1e-4
   */
  private determineXrayClass(flux: number): 'A' | 'B' | 'C' | 'M' | 'X' {
    if (flux >= 1e-4) return 'X';
    if (flux >= 1e-5) return 'M';
    if (flux >= 1e-6) return 'C';
    if (flux >= 1e-7) return 'B';
    return 'A';
  }

  /**
   * Detect solar flares from X-ray flux data
   * Look for significant spikes in flux levels
   */
  private detectFlares(xrayData: any[]): Array<{ time: Date; class: string; region: string }> {
    const flares: Array<{ time: Date; class: string; region: string }> = [];

    // Sample last 100 data points for spike detection
    const recentData = xrayData.slice(-100);

    for (let i = 5; i < recentData.length - 5; i++) {
      const current = parseFloat(recentData[i].flux) || 0;
      const prev = parseFloat(recentData[i - 1].flux) || 0;
      const next = parseFloat(recentData[i + 1].flux) || 0;

      // Detect significant spike (10x increase)
      if (current > prev * 10 && current > next) {
        const xrayClass = this.determineXrayClass(current);

        // Only record M and X class flares
        if (xrayClass === 'M' || xrayClass === 'X') {
          const magnitude = current / Math.pow(10, xrayClass === 'X' ? -4 : -5);
          flares.push({
            time: new Date(recentData[i].time_tag),
            class: `${xrayClass}${magnitude.toFixed(1)}`,
            region: 'Unknown', // NOAA API doesn't provide region in this endpoint
          });
        }
      }
    }

    // Return most recent 5 flares
    return flares.slice(-5);
  }

  /**
   * Get space weather alerts from NOAA
   */
  async getAlerts(): Promise<SpaceWeatherAlert[]> {
    try {
      const cached = this.getCache('alerts');
      if (cached) return cached;

      const response = await fetch(`${NOAA_BASE}/products/alerts.json`);
      if (!response.ok) throw new Error('Failed to fetch alerts');

      const data = await response.json();
      
      const alerts: SpaceWeatherAlert[] = data
        .slice(0, 5) // Latest 5 alerts
        .map((alert: any) => ({
          id: alert.product_id,
          type: this.classifyAlertType(alert.message),
          severity: this.determineSeverity(alert.message),
          message: alert.message,
          issuedTime: new Date(alert.issue_datetime),
        }));

      this.setCache('alerts', alerts);
      return alerts;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  }

  /**
   * Classify alert type from message content
   */
  private classifyAlertType(message: string): SpaceWeatherAlert['type'] {
    const lower = message.toLowerCase();
    if (lower.includes('geomagnetic') || lower.includes('kp')) return 'geomagnetic_storm';
    if (lower.includes('flare') || lower.includes('x-ray')) return 'solar_flare';
    if (lower.includes('radiation')) return 'radiation_storm';
    if (lower.includes('radio') || lower.includes('blackout')) return 'radio_blackout';
    return 'geomagnetic_storm';
  }

  /**
   * Determine severity from message content
   */
  private determineSeverity(message: string): SpaceWeatherAlert['severity'] {
    const lower = message.toLowerCase();
    if (lower.includes('extreme')) return 'extreme';
    if (lower.includes('severe')) return 'severe';
    if (lower.includes('strong')) return 'strong';
    if (lower.includes('moderate')) return 'moderate';
    return 'minor';
  }

  /**
   * Get all space weather data
   */
  async getAllData(): Promise<SpaceWeatherData> {
    const [kpIndex, solarWind, auroraOval, solarActivity, propagation, alerts] = await Promise.all([
      this.getKpIndex(),
      this.getSolarWind(),
      this.getAuroraOval(),
      this.getSolarActivity(),
      this.getPropagationForecast(),
      this.getAlerts(),
    ]);

    return {
      kpIndex,
      solarWind,
      auroraOval,
      solarActivity,
      propagation,
      lastUpdate: new Date(),
      alerts,
    };
  }

  /**
   * Cache helpers
   */
  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_DURATION) {
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
export const spaceWeatherAPI = new SpaceWeatherAPI();
