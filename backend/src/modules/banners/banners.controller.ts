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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get active hero banners for public homepage slider' })
  @ApiResponse({ status: 200, description: 'List of active banners' })
  async findPublic() {
    return this.bannersService.findPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Get()
  @ApiOperation({ summary: 'List all banners for admin backoffice' })
  @ApiResponse({ status: 200, description: 'All banners' })
  async findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Get(':id')
  @ApiOperation({ summary: 'Get banner by id' })
  @ApiResponse({ status: 200, description: 'Banner details' })
  async findById(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Post()
  @ApiOperation({ summary: 'Create new banner slide (Admin only)' })
  @ApiResponse({ status: 201, description: 'Banner created' })
  async create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Patch(':id')
  @ApiOperation({ summary: 'Update banner details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle banner active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner status toggled' })
  async toggleActive(@Param('id') id: string) {
    return this.bannersService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete banner slide (soft-delete, Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner deleted' })
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
