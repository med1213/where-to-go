import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectPlaceDto {
  @ApiPropertyOptional({ example: 'Photo is too blurry or place is a duplicate submission' })
  @IsOptional()
  @IsString()
  reason?: string;
}
