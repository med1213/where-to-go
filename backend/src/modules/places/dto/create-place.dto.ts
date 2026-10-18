import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Tad Fane Waterfall (ຕາດຟານ)', description: 'Place title in English or Lao' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Tad Fane is a picturesque twin waterfall dropping 120 metres in the Bolaven Plateau.',
    description: 'Detailed description of the attraction, best time to visit, and activities',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 2, description: 'Category ID (e.g. 1=Cafe, 2=Waterfall, 3=Nature, 4=Culture)' })
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 'Champasak', description: 'Province in Laos' })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiPropertyOptional({ example: 4, description: 'Province relational ID' })
  @IsOptional()
  @IsInt()
  provinceId?: number;

  @ApiPropertyOptional({ example: 'Paksong', description: 'District in Laos' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 12, description: 'District relational ID' })
  @IsOptional()
  @IsInt()
  districtId?: number;

  @ApiPropertyOptional({ example: 'Km 38, Route 16E, Bolaven Plateau', description: 'Physical address or road directions' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 15.1834, description: 'GPS Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.1287, description: 'GPS Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '$$ (40,000 LAK)', description: 'General price range' })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({ example: '10,000 LAK', description: 'Ticket price for Lao nationals (ລາຄາຄົນລາວ)' })
  @IsOptional()
  @IsString()
  priceLao?: string;

  @ApiPropertyOptional({ example: '25,000 LAK ($1.20)', description: 'Ticket price for Foreign travelers (ລາຄາຊາວຕ່າງຊາດ)' })
  @IsOptional()
  @IsString()
  priceForeigner?: string;

  @ApiPropertyOptional({ example: { daily: '08:00 - 17:00' }, description: 'Opening hours JSON' })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @ApiPropertyOptional({ example: { phone: '+856 20 5555 1234', facebook: 'tadfane.resort' }, description: 'Contact channels' })
  @IsOptional()
  @IsObject()
  contactInfo?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200'],
    description: 'Array of photo image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
