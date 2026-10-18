import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Cafes & Specialty Coffee', description: 'Category title in English or Lao' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'cafes', description: 'URL-friendly unique slug identifier' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'coffee', description: 'Icon name (e.g. coffee, mountain, waves, tree, landmark, utensils, tent, camera)' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 'Lao Arabica coffee roasters and chill cafes.', description: 'Brief category summary' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order priority' })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
