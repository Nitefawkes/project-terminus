import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MapsService } from './maps.service';
import {
  SatellitePositionQueryDto,
  SatellitePositionResponseDto,
} from './dto/satellite-position.dto';
import {
  GroundTrackQueryDto,
  GroundTrackResponseDto,
} from './dto/ground-track.dto';

@ApiTags('maps')
@Controller('maps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MapsController {
  private readonly logger = new Logger(MapsController.name);

  constructor(private readonly mapsService: MapsService) {}

  @Get('satellites/iss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current ISS position' })
  @ApiResponse({
    status: 200,
    description: 'ISS position retrieved successfully',
    type: SatellitePositionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'ISS position not available' })
  async getISSPosition(): Promise<SatellitePositionResponseDto> {
    this.logger.log('Fetching ISS position');
    return await this.mapsService.getISSPosition();
  }

  @Get('satellites/tle')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get satellite TLE (Two-Line Element) data' })
  @ApiQuery({
    name: 'noradId',
    required: true,
    description: 'NORAD catalog number',
    example: 25544,
  })
  @ApiResponse({
    status: 200,
    description: 'TLE data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'TLE data not found' })
  async getSatelliteTLE(@Query('noradId') noradId: number) {
    this.logger.log(`Fetching TLE for NORAD ${noradId}`);
    return await this.mapsService.getSatelliteTLE(Number(noradId));
  }

  @Get('satellites/ground-track')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get satellite ground track projection' })
  @ApiResponse({
    status: 200,
    description: 'Ground track retrieved successfully',
    type: GroundTrackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ground track not available' })
  async getGroundTrack(
    @Query() query: GroundTrackQueryDto,
  ): Promise<GroundTrackResponseDto> {
    const { noradId, duration = 90, step = 60 } = query;

    this.logger.log(
      `Fetching ground track for NORAD ${noradId} (${duration}min, ${step}s step)`,
    );

    const result = await this.mapsService.getGroundTrack(
      Number(noradId),
      Number(duration),
      Number(step),
    );

    return {
      ...result,
      noradId: Number(noradId),
      duration: Number(duration),
    };
  }

  @Get('satellites/popular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of popular satellites to track' })
  @ApiResponse({
    status: 200,
    description: 'Popular satellites list retrieved successfully',
  })
  getPopularSatellites() {
    this.logger.log('Fetching popular satellites list');
    return this.mapsService.getPopularSatellites();
  }

  @Get('satellites/positions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get positions for multiple satellites' })
  @ApiQuery({
    name: 'noradIds',
    required: true,
    description: 'Comma-separated list of NORAD IDs',
    example: '25544,20580,48274',
  })
  @ApiResponse({
    status: 200,
    description: 'Satellite positions retrieved successfully',
    type: [SatellitePositionResponseDto],
  })
  async getSatellitePositions(@Query('noradIds') noradIds: string) {
    const ids = noradIds.split(',').map((id) => Number(id.trim()));
    this.logger.log(`Fetching positions for satellites: ${ids.join(', ')}`);
    return await this.mapsService.getSatellitePositions(ids);
  }

  @Get('cache/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get cache statistics (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
  })
  getCacheStats() {
    this.logger.log('Fetching cache statistics');
    return this.mapsService.getCacheStats();
  }
}
