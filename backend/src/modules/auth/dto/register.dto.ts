import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'khamla_laos', description: 'Unique username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: '02055558888', description: 'Lao mobile phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Khamla Phetsavanh', description: 'Display name' })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'Password@123', description: 'Password (min 6 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
