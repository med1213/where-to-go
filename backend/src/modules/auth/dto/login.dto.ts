import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username or Lao Phone Number (e.g. 02099999999 or admin)',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'Admin@123456', description: 'Account password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
