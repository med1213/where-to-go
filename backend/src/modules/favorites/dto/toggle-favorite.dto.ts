import { ApiPropertyOptional } from '@nestjs/swagger';
import { FavoriteType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ToggleFavoriteDto {
  @ApiPropertyOptional({ enum: FavoriteType, default: FavoriteType.WANNA_GO })
  @IsOptional()
  @IsEnum(FavoriteType)
  listType?: FavoriteType = FavoriteType.WANNA_GO;

  @ApiPropertyOptional({ example: 'Visit early morning during winter season' })
  @IsOptional()
  @IsString()
  personalNote?: string;
}
