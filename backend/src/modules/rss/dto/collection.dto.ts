import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  feedIds?: string[]; // Initial feeds to add
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class AddFeedsToCollectionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  feedIds: string[];
}

export class RemoveFeedsFromCollectionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  feedIds: string[];
}
