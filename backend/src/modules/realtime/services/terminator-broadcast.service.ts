import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RealtimeGateway } from '../realtime.gateway';

interface TerminatorData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      fill: string;
      fillOpacity: number;
    };
  }>;
  sunPosition: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

@Injectable()
export class TerminatorBroadcastService {
  private readonly logger = new Logger(TerminatorBroadcastService.name);
  private gateway: RealtimeGateway;

  setGateway(gateway: RealtimeGateway) {
    this.gateway = gateway;
  }

  // Update terminator every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async broadcastTerminator() {
    if (!this.gateway) return;

    try {
      const now = new Date();
      const terminatorData = this.calculateTerminator(now);

      this.gateway.broadcastTerminatorUpdate(terminatorData);

      this.logger.debug(
        `Terminator Update - Sun at: ${terminatorData.sunPosition.latitude.toFixed(2)}, ${terminatorData.sunPosition.longitude.toFixed(2)}`,
      );
    } catch (error) {
      this.logger.error(`Failed to calculate terminator: ${error.message}`);
    }
  }

  private calculateTerminator(date: Date): TerminatorData {
    // Solar declination and hour angle calculations
    const dayOfYear = this.getDayOfYear(date);
    const declination = this.getSolarDeclination(dayOfYear);

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const timeDecimal = hours + minutes / 60 + seconds / 3600;

    const solarLongitude = (timeDecimal / 24) * 360 - 180;

    // Generate terminator line coordinates
    const coordinates: number[][] = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const lat = -90 + (180 * i) / steps;
      const latRad = (lat * Math.PI) / 180;
      const decRad = (declination * Math.PI) / 180;

      // Calculate solar hour angle at terminator
      const cosH = -Math.tan(latRad) * Math.tan(decRad);

      if (cosH >= -1 && cosH <= 1) {
        const hourAngle = (Math.acos(cosH) * 180) / Math.PI;
        const lon1 = solarLongitude - hourAngle;
        const lon2 = solarLongitude + hourAngle;

        coordinates.push([this.normalizeLongitude(lon1), lat]);
        coordinates.unshift([this.normalizeLongitude(lon2), lat]);
      }
    }

    // Close the polygon
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
          properties: {
            fill: '#000080',
            fillOpacity: 0.3,
          },
        },
      ],
      sunPosition: {
        latitude: declination,
        longitude: solarLongitude,
      },
      timestamp: date,
    };
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  private getSolarDeclination(dayOfYear: number): number {
    // Simplified solar declination formula
    const angle = (2 * Math.PI * (dayOfYear - 81)) / 365;
    return 23.45 * Math.sin(angle);
  }

  private normalizeLongitude(lon: number): number {
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;
    return lon;
  }
}
