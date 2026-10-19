import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication (JWT PS512)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new traveler account with Username or Lao Phone Number' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with Username OR Phone Number + Password (returns PS512 JWT Access & Refresh Token)' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate Refresh Token and issue new PS512 Access Token' })
  @ApiResponse({ status: 200, description: 'Tokens renewed' })
  async refresh(@Body() dto: RefreshTokenDto, @Headers('authorization') authHeader?: string) {
    const rawToken =
      dto?.refreshToken ||
      dto?.token ||
      dto?.accessToken ||
      (authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : authHeader);
    return this.authService.refreshTokens(rawToken || '');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Logout, blacklist access token, and revoke refresh token' })
  async logout(
    @CurrentUser('id') userId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const rawToken =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : undefined;
    return this.authService.logout(userId, rawToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user profile' })
  async me(@CurrentUser() user: any) {
    return user;
  }
}
