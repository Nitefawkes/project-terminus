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
}

export interface SatellitePassPrediction {
  startTime: Date;
  endTime: Date;
  maxElevation: number;
  duration: number;
  visible: boolean;
}
