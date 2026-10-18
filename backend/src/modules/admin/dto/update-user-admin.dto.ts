import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserAdminDto } from './create-user-admin.dto';

export class UpdateUserAdminDto extends PartialType(CreateUserAdminDto) {
  @ApiPropertyOptional({ example: 'NewPassword@123', description: 'Reset password if provided' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Change user role (USER, MODERATOR, ADMIN)' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
