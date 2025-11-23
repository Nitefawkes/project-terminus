import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RealtimeGateway } from '../realtime.gateway';
import axios from 'axios';

interface SatellitePosition {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: Date;
}

@Injectable()
export class SatelliteBroadcastService {
  private readonly logger = new Logger(SatelliteBroadcastService.name);
  private gateway: RealtimeGateway;

  setGateway(gateway: RealtimeGateway) {
    this.gateway = gateway;
  }

  // Update ISS position every 5 seconds
  @Cron(CronExpression.EVERY_5_SECONDS)
  async broadcastISSPosition() {
    if (!this.gateway) return;

    try {
      const response = await axios.get('http://api.open-notify.org/iss-now.json');

      if (response.data && response.data.iss_position) {
        const satelliteData: SatellitePosition = {
          name: 'ISS',
          latitude: parseFloat(response.data.iss_position.latitude),
          longitude: parseFloat(response.data.iss_position.longitude),
          altitude: 408, // ISS average altitude in km
          velocity: 7.66, // ISS average velocity in km/s
          timestamp: new Date(response.data.timestamp * 1000),
        };

        this.gateway.broadcastSatelliteUpdate({
          satellite: satelliteData,
          type: 'position',
        });

        this.logger.debug(
          `ISS Position: ${satelliteData.latitude.toFixed(2)}, ${satelliteData.longitude.toFixed(2)}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to fetch ISS position: ${error.message}`);
    }
  }

  // You can add more satellites here using TLE data from celestrak.org
  // @Cron(CronExpression.EVERY_10_SECONDS)
  // async broadcastOtherSatellites() {
  //   // Implement TLE-based satellite tracking
  // }
}
