import { IsString, IsEnum, IsBoolean, IsNumber, IsUrl, IsOptional, Min } from 'class-validator';
import { FeedType } from '../entities/rss-feed.entity';

export class CreateFeedDto {
  @IsUrl()
  url: string;

  @IsString()
  name: string;

  @IsEnum(FeedType)
  type: FeedType;

  @IsString()
  subtype: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  refreshInterval?: number;

  @IsBoolean()
  @IsOptional()
  geocodingEnabled?: boolean;
}
