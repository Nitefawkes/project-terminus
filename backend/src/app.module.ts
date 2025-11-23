import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
// import { MapsModule } from './modules/maps/maps.module';
// import { SatellitesModule } from './modules/satellites/satellites.module';
// import { OsintModule } from './modules/osint/osint.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'project_terminus',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development', // Only in development
      logging: process.env.NODE_ENV === 'development',
    }),

    // Scheduler for background tasks
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    RealtimeModule,
    // MapsModule,
    // SatellitesModule,
    // OsintModule,
  ],
})
export class AppModule {}
