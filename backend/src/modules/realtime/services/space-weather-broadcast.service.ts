import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RealtimeGateway } from '../realtime.gateway';
import axios from 'axios';

interface SpaceWeatherData {
  kpIndex: number;
  solarWind: {
    speed: number; // km/s
    density: number; // particles/cm³
  };
  magneticField: {
    bt: number; // nT
    bz: number; // nT
  };
  xrayFlux: {
    short: number;
    long: number;
    class: string;
  };
  timestamp: Date;
}

@Injectable()
export class SpaceWeatherBroadcastService {
  private readonly logger = new Logger(SpaceWeatherBroadcastService.name);
  private gateway: RealtimeGateway;

  setGateway(gateway: RealtimeGateway) {
    this.gateway = gateway;
  }

  // Update space weather every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async broadcastSpaceWeather() {
    if (!this.gateway) return;

    try {
      // Fetch from NOAA SWPC
      const [kpResponse, solarWindResponse, magResponse] = await Promise.all([
        axios.get('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
        axios.get('https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json'),
        axios.get('https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json'),
      ]);

      // Parse Kp index (last available value)
      const kpData = kpResponse.data.slice(-1)[0];
      const kpIndex = kpData ? parseFloat(kpData[1]) : 0;

      // Parse solar wind (last available value)
      const solarWindData = solarWindResponse.data.slice(-1)[0];
      const solarWind = solarWindData
        ? {
            speed: parseFloat(solarWindData[5]) || 0,
            density: parseFloat(solarWindData[1]) || 0,
          }
        : { speed: 0, density: 0 };

      // Parse magnetic field (last available value)
      const magData = magResponse.data.slice(-1)[0];
      const magneticField = magData
        ? {
            bt: parseFloat(magData[6]) || 0,
            bz: parseFloat(magData[3]) || 0,
          }
        : { bt: 0, bz: 0 };

      const weatherData: SpaceWeatherData = {
        kpIndex,
        solarWind,
        magneticField,
        xrayFlux: {
          short: 0, // Would need to fetch from GOES data
          long: 0,
          class: 'A',
        },
        timestamp: new Date(),
      };

      this.gateway.broadcastSpaceWeatherUpdate(weatherData);

      this.logger.debug(
        `Space Weather - Kp: ${kpIndex}, Solar Wind: ${solarWind.speed} km/s`,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch space weather: ${error.message}`);
    }
  }
}
