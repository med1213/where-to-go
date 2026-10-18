import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'ທ່ຽວລາວປີ 2026: ສໍາຜັດມົນສະເໜ່ເມືອງມໍລະດົກໂລກ ຫຼວງພະບາງ' })
  @IsString()
  @IsNotEmpty()
  titleLo: string;

  @ApiPropertyOptional({ example: 'Visit Laos 2026: Experience the World Heritage Town of Luang Prabang' })
  @IsString()
  @IsOptional()
  titleEn?: string;

  @ApiPropertyOptional({ example: 'ນ້ຳຕົກຕາດກວາງຊີ, ພູສີ, ວັດຊຽງທອງ ແລະ ວິຖີຊີວິດແຄມຂອງ' })
  @IsString()
  @IsOptional()
  subtitleLo?: string;

  @ApiPropertyOptional({ example: 'Kuang Si Falls, Mount Phousi, Wat Xieng Thong & Mekong sunset' })
  @IsString()
  @IsOptional()
  subtitleEn?: string;

  @ApiProperty({ example: 'http://localhost:4000/uploads/banner-1.webp' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: '/places/kuang-si-falls-luang-prabang' })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 'uuid-of-place' })
  @IsString()
  @IsOptional()
  placeId?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
