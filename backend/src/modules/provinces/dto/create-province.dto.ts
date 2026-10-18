import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProvinceDto {
  @ApiProperty({ example: 'VTE', description: 'Unique province 2-4 letter code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'ນະຄອນຫຼວງວຽງຈັນ', description: 'Lao name' })
  @IsString()
  @IsNotEmpty()
  nameLo: string;

  @ApiProperty({ example: 'Vientiane Capital', description: 'English name' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'vientiane-capital', description: 'Unique slug' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Pha That Luang, Patuxay', description: 'Tourist highlight' })
  @IsString()
  @IsOptional()
  highlight?: string;
}
