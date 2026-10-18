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
import { ProvincesService } from './provinces.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Provinces & Districts of Laos')
@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all 18 provinces of Laos with district counts and approved attraction counts' })
  @ApiResponse({ status: 200, description: 'All provinces list' })
  async findAll() {
    return this.provincesService.findAll();
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get details of a province, including its districts and attractions' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.provincesService.findOne(idOrSlug);
  }

  @Public()
  @Get(':id/districts')
  @ApiOperation({ summary: 'List all districts belonging to a province' })
  async getDistricts(@Param('id') provinceId: string) {
    return this.provincesService.getDistricts(+provinceId);
  }

  // --- Admin Province CRUD ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Post()
  @ApiOperation({ summary: 'Create a new province (Admin only)' })
  async createProvince(@Body() dto: CreateProvinceDto) {
    return this.provincesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Patch(':id')
  @ApiOperation({ summary: 'Update province details (Admin only)' })
  async updateProvince(@Param('id') id: string, @Body() dto: UpdateProvinceDto) {
    return this.provincesService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a province (Admin only)' })
  async deleteProvince(@Param('id') id: string) {
    return this.provincesService.softDelete(+id);
  }

  // --- Admin District CRUD ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Post(':id/districts')
  @ApiOperation({ summary: 'Add a new district to a province (Admin only)' })
  async createDistrict(
    @Param('id') provinceId: string,
    @Body() dto: CreateDistrictDto,
  ) {
    return this.provincesService.createDistrict(+provinceId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @Patch('districts/:districtId')
  @ApiOperation({ summary: 'Update district details (Admin only)' })
  async updateDistrict(
    @Param('districtId') districtId: string,
    @Body() dto: UpdateDistrictDto,
  ) {
    return this.provincesService.updateDistrict(+districtId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-PS512')
  @HttpCode(HttpStatus.OK)
  @Delete('districts/:districtId')
  @ApiOperation({ summary: 'Soft-delete a district (Admin only)' })
  async deleteDistrict(@Param('districtId') districtId: string) {
    return this.provincesService.deleteDistrict(+districtId);
  }
}
