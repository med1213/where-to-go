import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Best time to take photos is around sunset. Very friendly local staff!',
    description: 'Travel tip, review, or advice',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 5, description: 'Star rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: ['https://example.com/photo.webp'], description: 'Attached comment review images' })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ example: 'uuid-of-parent-comment', description: 'Parent comment ID if this is a reply' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
