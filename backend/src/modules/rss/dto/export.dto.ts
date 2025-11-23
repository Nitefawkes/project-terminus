import { IsEnum, IsOptional, IsBoolean, IsArray, IsString } from 'class-validator';

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
}

export class ExportItemsDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemIds?: string[]; // Specific items to export (if not provided, uses current query)
}
