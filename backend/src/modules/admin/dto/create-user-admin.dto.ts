import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserAdminDto {
  @ApiProperty({ example: 'khamla_lao', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '02055667788', description: 'Lao mobile phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Khamla Sengsouvanh', description: 'Display name in Lao or English' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: 'Password@123', description: 'User login password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, default: Role.USER, description: 'User permission level (USER, MODERATOR, ADMIN)' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...', description: 'Avatar image URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
