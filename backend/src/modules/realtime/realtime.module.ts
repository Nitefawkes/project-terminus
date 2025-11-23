import { Module } from '@nestjs/common';
import { JwtModule} from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RealtimeGateway } from './realtime.gateway';
import { SatelliteBroadcastService } from './services/satellite-broadcast.service';
import { SpaceWeatherBroadcastService } from './services/space-weather-broadcast.service';
import { TerminatorBroadcastService } from './services/terminator-broadcast.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RealtimeGateway,
    SatelliteBroadcastService,
    SpaceWeatherBroadcastService,
    TerminatorBroadcastService,
  ],
  exports: [RealtimeGateway],
})
export class RealtimeModule {
  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly satelliteService: SatelliteBroadcastService,
    private readonly spaceWeatherService: SpaceWeatherBroadcastService,
    private readonly terminatorService: TerminatorBroadcastService,
  ) {
    // Inject gateway into services
    this.satelliteService.setGateway(this.gateway);
    this.spaceWeatherService.setGateway(this.gateway);
    this.terminatorService.setGateway(this.gateway);
  }
}
