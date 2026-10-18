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
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { RejectPlaceDto } from './dto/review-place.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Admin & Moderation Portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@ApiBearerAuth('JWT-PS512')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform summary statistics (places, pending approvals, users, trashed items)' })
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('rankings')
  @ApiOperation({ summary: 'Top ranked places with engagement tiers (Tier S, A, B, C)' })
  async getRankings(@Query('limit') limit = 20) {
    return this.adminService.getPlaceRankings(+limit);
  }

  @Get('places/pending')
  @ApiOperation({ summary: 'List submitted places waiting for admin review' })
  @ApiResponse({ status: 200, description: 'Pending places queue' })
  async getPendingPlaces(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getPendingPlaces(+page, +limit);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('places/:id/approve')
  @ApiOperation({ summary: 'Approve a submitted place (becomes publicly visible)' })
  async approvePlace(
    @Param('id') placeId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approvePlace(placeId, adminId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('places/:id/reject')
  @ApiOperation({ summary: 'Reject a submitted place with optional feedback reason' })
  async rejectPlace(
    @Param('id') placeId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectPlaceDto,
  ) {
    return this.adminService.rejectPlace(placeId, adminId, dto.reason);
  }

  @Get('trash')
  @ApiOperation({ summary: 'View all soft-deleted places, comments, and users in the Trash Bin' })
  async getTrash() {
    return this.adminService.getTrashItems();
  }

  @HttpCode(HttpStatus.OK)
  @Patch('trash/places/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted place' })
  async restorePlace(@Param('id') placeId: string) {
    return this.adminService.restorePlace(placeId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('trash/comments/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted comment' })
  async restoreComment(@Param('id') commentId: string) {
    return this.adminService.restoreComment(commentId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('trash/users/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user account' })
  async restoreUser(@Param('id') userId: string) {
    return this.adminService.restoreUser(userId);
  }

  @Roles(Role.ADMIN)
  @Delete('trash/places/:id/permanent')
  @ApiOperation({ summary: 'Permanently purge a place and its dependencies (Admin only)' })
  async hardDeletePlace(@Param('id') placeId: string) {
    return this.adminService.hardDeletePlace(placeId);
  }

  @Roles(Role.ADMIN)
  @Delete('trash/users/:id/permanent')
  @ApiOperation({ summary: 'Permanently purge a user and their dependencies (Admin only)' })
  async hardDeleteUser(@Param('id') userId: string) {
    return this.adminService.hardDeleteUser(userId);
  }

  // --- Users & Roles Management CRUD with Relationships ---
  @Roles(Role.ADMIN)
  @Post('users')
  @ApiOperation({ summary: 'Create a new user with specified role (Admin only)' })
  async createUser(@Body() dto: CreateUserAdminDto) {
    return this.adminService.createUser(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all registered travelers and administrators' })
  async getAllUsers(@Query('q') q?: string, @Query('role') role?: Role) {
    return this.adminService.getAllUsers(q, role);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail with relationship tree (places, comments, favorites, reviews)' })
  async getUserById(@Param('id') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user profile, phone, username, role, or reset password' })
  async updateUser(@Param('id') userId: string, @Body() dto: UpdateUserAdminDto) {
    return this.adminService.updateUser(userId, dto);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role (USER, MODERATOR, ADMIN)' })
  async updateUserRole(@Param('id') userId: string, @Body('role') role: Role) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Roles(Role.ADMIN)
  @Delete('users/:id')
  @ApiOperation({ summary: 'Soft-delete / ban user account' })
  async softDeleteUser(@Param('id') userId: string) {
    return this.adminService.softDeleteUser(userId);
  }

  // --- Comments Moderation ---
  @Get('comments')
  @ApiOperation({ summary: 'List all comments across attractions' })
  async getAllComments(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getAllComments(+page, +limit);
  }

  // --- Category Management ---
  @Roles(Role.ADMIN)
  @Post('categories')
  @ApiOperation({ summary: 'Create new category (Admin only)' })
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.adminService.createCategory(body);
  }

  @Roles(Role.ADMIN)
  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.adminService.updateCategory(+id, body);
  }

  @Roles(Role.ADMIN)
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Soft-delete category' })
  async softDeleteCategory(@Param('id') id: string) {
    return this.adminService.softDeleteCategory(+id);
  }
}
