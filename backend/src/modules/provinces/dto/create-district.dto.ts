import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDistrictDto {
  @ApiProperty({ example: 'ຈັນທະບູລີ', description: 'District name in Lao' })
  @IsString()
  @IsNotEmpty()
  nameLo: string;

  @ApiProperty({ example: 'Chanthabouly', description: 'District name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'chanthabouly', description: 'District slug' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: '0101', description: 'Official district code' })
  @IsString()
  @IsOptional()
  code?: string;
}
