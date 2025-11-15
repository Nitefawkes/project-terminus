/**
 * Day/Night Terminator Calculation
 * Calculates the solar terminator line for the given date/time
 */

import SunCalc from 'suncalc';

export interface TerminatorPoint {
  lng: number;
  lat: number;
}

/**
 * Calculate the solar terminator (day/night boundary) for a given time
 * Returns a GeoJSON-compatible coordinate array
 */
export function calculateTerminator(date: Date = new Date()): TerminatorPoint[] {
  const points: TerminatorPoint[] = [];
  const precision = 2; // degrees between points (lower = more precise)
  
  // Calculate points along longitude
  for (let lng = -180; lng <= 180; lng += precision) {
    // Use binary search to find the latitude where sun altitude is ~0
    let minLat = -90;
    let maxLat = 90;
    let lat = 0;
    
    // Binary search for terminator latitude at this longitude
    for (let i = 0; i < 20; i++) { // 20 iterations for precision
      lat = (minLat + maxLat) / 2;
      const sunPos = SunCalc.getPosition(date, lat, lng);
      const altitude = sunPos.altitude * (180 / Math.PI); // Convert to degrees
      
      if (altitude > 0) {
        maxLat = lat;
      } else {
        minLat = lat;
      }
    }
    
    points.push({ lng, lat });
  }
  
  return points;
}

/**
 * Convert terminator points to GeoJSON LineString
 */
export function terminatorToGeoJSON(points: TerminatorPoint[]) {
  return {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: points.map(p => [p.lng, p.lat]),
    },
    properties: {
      type: 'terminator',
      time: new Date().toISOString(),
    },
  };
}

/**
 * Check if a point is in daylight
 */
export function isInDaylight(lat: number, lng: number, date: Date = new Date()): boolean {
  const sunPos = SunCalc.getPosition(date, lat, lng);
  return sunPos.altitude > 0;
}

/**
 * Get solar position info for display
 */
export function getSolarInfo(lat: number, lng: number, date: Date = new Date()) {
  const sunPos = SunCalc.getPosition(date, lat, lng);
  const times = SunCalc.getTimes(date, lat, lng);
  
  return {
    altitude: sunPos.altitude * (180 / Math.PI),
    azimuth: sunPos.azimuth * (180 / Math.PI),
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
  };
}
