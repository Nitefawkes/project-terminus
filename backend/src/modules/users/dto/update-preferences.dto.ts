import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  mapStyle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  defaultZoom?: number;

  @IsOptional()
  defaultCenter?: { lat: number; lng: number };

  @IsOptional()
  @IsArray()
  enabledLayers?: string[];
}

