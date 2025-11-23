import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdateObserverLocationDto {
  @ApiProperty({
    description: 'Observer location name',
    example: 'Home',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Observer latitude',
    example: 40.7128,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Observer longitude',
    example: -74.006,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Observer altitude in meters',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  altitude?: number;
}
