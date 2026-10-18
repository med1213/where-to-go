import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Places & Attractions')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse approved places with category, province, and search filters' })
  @ApiResponse({ status: 200, description: 'List of approved places' })
  async findPublic(@Query() query: QueryPlacesDto) {
    return this.placesService.findPublic(query);
  }

  @Public()
  @Get(':slugOrId')
  @ApiOperation({ summary: 'Get place details by slug or UUID (increments view count)' })
  @ApiResponse({ status: 200, description: 'Place details with photos and approved comments' })
  async findBySlugOrId(@Param('slugOrId') slugOrId: string) {
    return this.placesService.findBySlugOrId(slugOrId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Post()
  @ApiOperation({ summary: 'Submit a new place to visit (requires login, defaults to PENDING status for admin review)' })
  @ApiResponse({ status: 201, description: 'Place submitted for review' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreatePlaceDto,
  ) {
    return this.placesService.create(userId, role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Get('user/my-places')
  @ApiOperation({ summary: 'List all places submitted by the currently logged-in user' })
  async findMyPlaces(@CurrentUser('id') userId: string) {
    return this.placesService.findMyPlaces(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing place submission (owner or admin only)' })
  async update(
    @Param('id') placeId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: any,
  ) {
    return this.placesService.update(placeId, userId, role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a place (owner or admin only)' })
  async softDelete(
    @Param('id') placeId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.placesService.softDelete(placeId, userId, role);
  }
}
