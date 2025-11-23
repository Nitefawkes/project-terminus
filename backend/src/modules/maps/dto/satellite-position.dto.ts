import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SatellitePositionQueryDto {
  @ApiProperty({
    description: 'NORAD catalog number of the satellite',
    example: 25544,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  noradId?: number;

  @ApiProperty({
    description: 'Satellite name',
    example: 'ISS (ZARYA)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Observer latitude for visibility calculations',
    example: 40.7128,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  observerLat?: number;

  @ApiProperty({
    description: 'Observer longitude for visibility calculations',
    example: -74.006,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  observerLng?: number;
}

export class SatellitePositionResponseDto {
  @ApiProperty({ description: 'Satellite name' })
  name: string;

  @ApiProperty({ description: 'NORAD catalog number' })
  noradId: number;

  @ApiProperty({ description: 'Latitude in degrees' })
  latitude: number;

  @ApiProperty({ description: 'Longitude in degrees' })
  longitude: number;

  @ApiProperty({ description: 'Altitude in kilometers' })
  altitude: number;

  @ApiProperty({ description: 'Azimuth in degrees (from observer)' })
  azimuth: number;

  @ApiProperty({ description: 'Elevation in degrees (from observer)' })
  elevation: number;

  @ApiProperty({ description: 'Right ascension in degrees' })
  rightAscension: number;

  @ApiProperty({ description: 'Declination in degrees' })
  declination: number;

  @ApiProperty({ description: 'Timestamp of position' })
  timestamp: Date;
}
