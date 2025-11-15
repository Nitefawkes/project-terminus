/**
 * Space Weather Data Types
 * Definitions for NOAA SWPC data structures
 */

export interface KpIndex {
  time: string;
  kp: number; // 0-9 scale
  observedTime: Date;
}

export interface SolarWind {
  time: string;
  speed: number; // km/s
  density: number; // particles/cm³
  temperature: number; // Kelvin
  bz: number; // nT (southward component)
  bt: number; // nT (total field)
  observedTime: Date;
}

export interface AuroraOval {
  hemisphere: 'north' | 'south';
  coordinates: Array<{ lat: number; lng: number }>;
  intensity: number; // 0-10 scale
  timestamp: Date;
}

export interface SolarActivity {
  xrayFlux: {
    shortWave: number;
    longWave: number;
    class: 'A' | 'B' | 'C' | 'M' | 'X';
  };
  solarFlares: Array<{
    time: Date;
    class: string;
    region: string;
  }>;
  protonFlux: number;
}

export interface PropagationForecast {
  band: '160m' | '80m' | '40m' | '20m' | '15m' | '10m' | '6m' | '2m';
  day: 'poor' | 'fair' | 'good' | 'excellent';
  night: 'poor' | 'fair' | 'good' | 'excellent';
  conditions: string;
}

export interface SpaceWeatherData {
  kpIndex: KpIndex | null;
  solarWind: SolarWind | null;
  auroraOval: AuroraOval | null;
  solarActivity: SolarActivity | null;
  propagation: PropagationForecast[];
  lastUpdate: Date;
  alerts: SpaceWeatherAlert[];
}

export interface SpaceWeatherAlert {
  id: string;
  type: 'geomagnetic_storm' | 'solar_flare' | 'radio_blackout' | 'radiation_storm';
  severity: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme';
  message: string;
  issuedTime: Date;
  expiresTime?: Date;
}

/**
 * Kp Index interpretation for display
 */
export function getKpStatus(kp: number): {
  level: 'quiet' | 'unsettled' | 'active' | 'minor' | 'major' | 'severe' | 'extreme';
  color: string;
  description: string;
} {
  if (kp < 4) {
    return {
      level: 'quiet',
      color: '#10b981', // green
      description: 'Quiet conditions, normal propagation',
    };
  } else if (kp < 5) {
    return {
      level: 'unsettled',
      color: '#f59e0b', // amber
      description: 'Unsettled, possible aurora at high latitudes',
    };
  } else if (kp < 6) {
    return {
      level: 'active',
      color: '#f59e0b', // amber
      description: 'Active, aurora likely at high latitudes',
    };
  } else if (kp < 7) {
    return {
      level: 'minor',
      color: '#ef4444', // red
      description: 'Minor storm, aurora visible at mid-latitudes',
    };
  } else if (kp < 8) {
    return {
      level: 'major',
      color: '#dc2626', // dark red
      description: 'Major storm, widespread aurora, HF degraded',
    };
  } else if (kp < 9) {
    return {
      level: 'severe',
      color: '#991b1b', // darker red
      description: 'Severe storm, HF communications disrupted',
    };
  } else {
    return {
      level: 'extreme',
      color: '#7f1d1d', // darkest red
      description: 'Extreme storm, widespread HF blackout',
    };
  }
}

/**
 * Band conditions interpretation
 */
export function getPropagationColor(condition: string): string {
  switch (condition.toLowerCase()) {
    case 'excellent':
      return '#10b981'; // green
    case 'good':
      return '#84cc16'; // lime
    case 'fair':
      return '#f59e0b'; // amber
    case 'poor':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}
