import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FavoriteType } from '@prisma/client';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Favorites & "I Wanna Go" Bucket List')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-PS512')
@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @HttpCode(HttpStatus.OK)
  @Post('places/:placeId/favorite')
  @ApiOperation({ summary: 'Toggle "I Wanna Go" (ຢາກໄປ) or Favorite on a place' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled' })
  async toggle(
    @Param('placeId') placeId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleFavoriteDto,
  ) {
    return this.favoritesService.toggle(placeId, userId, dto);
  }

  @Get('users/me/bucket-list')
  @ApiOperation({ summary: 'Get current user personal "I Wanna Go" bucket list' })
  @ApiResponse({ status: 200, description: 'List of bucket list places' })
  async getMyBucketList(
    @CurrentUser('id') userId: string,
    @Query('type') type?: FavoriteType,
  ) {
    return this.favoritesService.getMyBucketList(userId, type);
  }

  @Get('places/:placeId/favorite/status')
  @ApiOperation({ summary: 'Check if current user marked this place as Wanna Go or Favorite' })
  async checkStatus(
    @Param('placeId') placeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.checkStatus(placeId, userId);
  }
}
