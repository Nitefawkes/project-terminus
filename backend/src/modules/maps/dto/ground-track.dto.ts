import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GroundTrackQueryDto {
  @ApiProperty({
    description: 'NORAD catalog number of the satellite',
    example: 25544,
  })
  @IsNumber()
  noradId: number;

  @ApiProperty({
    description: 'Number of minutes to calculate forward',
    example: 90,
    default: 90,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1440)
  duration?: number;

  @ApiProperty({
    description: 'Time step in seconds between points',
    example: 60,
    default: 60,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(300)
  step?: number;
}

export class GroundTrackResponseDto {
  @ApiProperty({
    description: 'Array of [longitude, latitude] coordinates',
    type: [[Number]],
  })
  coordinates: Array<[number, number]>;

  @ApiProperty({
    description: 'Corresponding timestamps for each coordinate',
    type: [Date],
  })
  timestamps: Date[];

  @ApiProperty({
    description: 'NORAD catalog number',
  })
  noradId: number;

  @ApiProperty({
    description: 'Duration in minutes',
  })
  duration: number;
}
