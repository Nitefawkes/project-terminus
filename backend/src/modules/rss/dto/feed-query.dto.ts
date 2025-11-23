import { IsOptional, IsEnum, IsString, IsBoolean, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { FeedType } from '../entities/rss-feed.entity';

export class FeedQueryDto {
  @IsOptional()
  @IsEnum(FeedType)
  type?: FeedType;

  @IsOptional()
  @IsString()
  subtype?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;
}

export class ItemQueryDto {
  @IsOptional()
  @IsString({ each: true })
  feedIds?: string[];

  @IsOptional()
  @IsEnum(FeedType, { each: true })
  types?: FeedType[];

  @IsOptional()
  @IsString({ each: true })
  subtypes?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  geocoded?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  read?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  starred?: boolean;

  @IsOptional()
  @IsDateString()
  since?: string;

  @IsOptional()
  @IsDateString()
  until?: string;

  @IsOptional()
  @IsString()
  search?: string;

  // Geospatial filtering
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nearLat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  nearLng?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20000) // Max 20,000 km (half Earth's circumference)
  @Type(() => Number)
  radiusKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}

export class MapBoundsDto {
  @IsNumber()
  @Type(() => Number)
  north: number;

  @IsNumber()
  @Type(() => Number)
  south: number;

  @IsNumber()
  @Type(() => Number)
  east: number;

  @IsNumber()
  @Type(() => Number)
  west: number;
}

export class MapItemsQueryDto extends ItemQueryDto {
  @IsOptional()
  bounds?: MapBoundsDto;
}
