import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  size?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nafdacNumber?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
