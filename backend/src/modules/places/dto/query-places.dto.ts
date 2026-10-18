import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SortOption {
  POPULAR = 'popular',
  RECENT = 'recent',
  FEATURED = 'featured',
}

export class QueryPlacesDto {
  @ApiPropertyOptional({ example: 'waterfall', description: 'Search keyword in title, description, or address' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'waterfall', description: 'Search keyword alias' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Luang Prabang', description: 'Filter by Laos province name or ID or slug' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 2, description: 'Filter by Province ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  provinceId?: number;

  @ApiPropertyOptional({ example: 5, description: 'Filter by District ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  districtId?: number;

  @ApiPropertyOptional({ example: 'waterfalls', description: 'Filter by category ID or slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 2, description: 'Filter by category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Sorting or recency filter: recent, popular, featured, 1 (1m), 3 (3m), 6 (6m), 9 (9m)',
    default: 'popular',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'popular';

  @ApiPropertyOptional({ default: 1, description: 'Page number (1-based index)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: 'Items per page (default: 20)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 0, description: 'Explicit offset for pagination (overrides page calculation)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
