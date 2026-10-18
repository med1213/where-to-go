import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PlaceStatus, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingPlaces(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {
      status: PlaceStatus.PENDING,
      deletedAt: null,
    };

    const [total, items] = await Promise.all([
      this.prisma.place.count({ where }),
      this.prisma.place.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: true,
          provinceRel: true,
          districtRel: true,
          media: { where: { deletedAt: null } },
          user: { select: { id: true, displayName: true, username: true, phoneNumber: true, avatarUrl: true } },
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approvePlace(placeId: string, adminId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID '${placeId}' not found`);
    }

    return this.prisma.place.update({
      where: { id: placeId },
      data: {
        status: PlaceStatus.APPROVED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        user: { select: { id: true, displayName: true } },
      },
    });
  }

  async rejectPlace(placeId: string, adminId: string, reason?: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID '${placeId}' not found`);
    }

    return this.prisma.place.update({
      where: { id: placeId },
      data: {
        status: PlaceStatus.REJECTED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Submission did not meet quality or content standards',
      },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        user: { select: { id: true, displayName: true } },
      },
    });
  }

  async getTrashItems() {
    const [places, comments, users] = await Promise.all([
      this.prisma.place.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
        include: {
          category: true,
          provinceRel: true,
          districtRel: true,
          user: { select: { id: true, displayName: true } },
        },
      }),
      this.prisma.comment.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
        include: {
          place: { select: { id: true, title: true, province: true } },
          user: { select: { id: true, displayName: true } },
        },
      }),
      this.prisma.user.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
        select: {
          id: true,
          displayName: true,
          username: true,
          phoneNumber: true,
          role: true,
          deletedAt: true,
        },
      }),
    ]);

    return {
      places,
      comments,
      users,
      totalCount: places.length + comments.length + users.length,
    };
  }

  async restorePlace(placeId: string) {
    return this.prisma.restorePlace(placeId);
  }

  async restoreComment(commentId: string) {
    return this.prisma.restoreComment(commentId);
  }

  async restoreUser(userId: string) {
    return this.prisma.restoreUser(userId);
  }

  async hardDeletePlace(placeId: string) {
    await this.prisma.placeMedia.deleteMany({ where: { placeId } });
    await this.prisma.comment.deleteMany({ where: { placeId } });
    await this.prisma.favorite.deleteMany({ where: { placeId } });
    await this.prisma.place.delete({ where: { id: placeId } });
    return { success: true, message: 'Permanently deleted place and related records' };
  }

  async hardDeleteUser(userId: string) {
    // Delete all child relations
    await this.prisma.comment.deleteMany({ where: { userId } });
    await this.prisma.favorite.deleteMany({ where: { userId } });
    const userPlaces = await this.prisma.place.findMany({ where: { userId }, select: { id: true } });
    for (const p of userPlaces) {
      await this.hardDeletePlace(p.id);
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'Permanently purged user account and all associated data' };
  }

  // --- Full User & Role Management with Relationships ---
  async createUser(dto: CreateUserAdminDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { phoneNumber: dto.phoneNumber }],
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException('Username or Phone Number is already in use');
    }

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.user.create({
      data: {
        username: dto.username,
        phoneNumber: dto.phoneNumber,
        displayName: dto.displayName,
        passwordHash,
        role: dto.role || Role.USER,
        avatarUrl: dto.avatarUrl || null,
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async getAllUsers(query?: string, role?: Role) {
    const where: any = { deletedAt: null };
    if (role) {
      where.role = role;
    }
    if (query) {
      where.OR = [
        { displayName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { phoneNumber: { contains: query } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        displayName: true,
        username: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            places: true,
            comments: true,
            favorites: true,
            reviewedPlaces: true,
          },
        },
      },
    });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        username: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
        deletedAt: true,
        places: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            provinceRel: true,
            districtRel: true,
          },
        },
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            place: { select: { id: true, title: true, province: true } },
          },
        },
        favorites: {
          where: { deletedAt: null },
          include: {
            place: { select: { id: true, title: true, province: true } },
          },
        },
        reviewedPlaces: {
          take: 20,
          orderBy: { reviewedAt: 'desc' },
          select: { id: true, title: true, status: true, reviewedAt: true },
        },
        _count: {
          select: { places: true, comments: true, favorites: true, reviewedPlaces: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  async updateUser(userId: string, dto: UpdateUserAdminDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    const data: any = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.phoneNumber !== undefined) data.phoneNumber = dto.phoneNumber;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.password) {
      data.passwordHash = await argon2.hash(dto.password);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        displayName: true,
        username: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        displayName: true,
        username: true,
        phoneNumber: true,
        role: true,
      },
    });
  }

  async softDeleteUser(userId: string) {
    return this.prisma.softDeleteUser(userId);
  }

  // --- Comments Moderation ---
  async getAllComments(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };

    const [total, items] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          place: {
            select: {
              id: true,
              title: true,
              slug: true,
              province: true,
              district: true,
              media: {
                where: { deletedAt: null },
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: { url: true, isCover: true },
              },
              user: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
              phoneNumber: true,
            },
          },
        },
      }),
    ]);

    return { items, total };
  }

  // --- Category Management (Delegate) ---
  async createCategory(data: { name: string; slug: string; icon?: string; description?: string; sortOrder?: number }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || null,
        description: data.description || null,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async updateCategory(id: number, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async softDeleteCategory(id: number) {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getPlatformStats() {
    const [
      totalPlaces,
      pendingPlaces,
      approvedPlaces,
      totalUsers,
      totalComments,
      totalFavorites,
      trashedPlaces,
      totalProvinces,
      totalDistricts,
    ] = await Promise.all([
      this.prisma.place.count(),
      this.prisma.place.count({ where: { status: PlaceStatus.PENDING, deletedAt: null } }),
      this.prisma.place.count({ where: { status: PlaceStatus.APPROVED, deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.favorite.count({ where: { deletedAt: null } }),
      this.prisma.place.count({ where: { deletedAt: { not: null } } }),
      this.prisma.province.count({ where: { deletedAt: null } }),
      this.prisma.district.count({ where: { deletedAt: null } }),
    ]);

    return {
      totalPlaces,
      pendingPlaces,
      approvedPlaces,
      totalUsers,
      totalComments,
      totalFavorites,
      trashedPlaces,
      totalProvinces,
      totalDistricts,
    };
  }

  async getPlaceRankings(limit = 20) {
    const places = await this.prisma.place.findMany({
      where: { status: PlaceStatus.APPROVED, deletedAt: null },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        media: { where: { deletedAt: null }, take: 1 },
        user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        comments: {
          where: { deletedAt: null },
          orderBy: { rating: 'desc' },
          take: 1,
          include: { user: { select: { displayName: true } } },
        },
        _count: { select: { comments: { where: { deletedAt: null } }, favorites: true } },
      },
    });

    const ranked = places
      .map((p) => {
        const score = p.viewCount * 1 + p.favoriteCount * 10 + p.commentCount * 15;
        let tier = 'TIER_C';
        let tierLabel = 'Tier C (Standard)';
        let tierColor = 'bg-stone-100 text-stone-700';

        if (score >= 250) {
          tier = 'TIER_S';
          tierLabel = 'Tier S (Diamond Elite)';
          tierColor = 'bg-purple-100 text-purple-800 border-purple-300';
        } else if (score >= 120) {
          tier = 'TIER_A';
          tierLabel = 'Tier A (Top Trending)';
          tierColor = 'bg-teal-100 text-teal-800 border-teal-300';
        } else if (score >= 50) {
          tier = 'TIER_B';
          tierLabel = 'Tier B (Rising Popular)';
          tierColor = 'bg-amber-100 text-amber-800 border-amber-300';
        }

        const topComment = p.comments?.[0];

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          province: p.province,
          district: p.district,
          categoryName: p.category?.name,
          coverImage: p.media?.[0]?.url || null,
          creator: {
            id: p.user?.id,
            displayName: p.user?.displayName || 'Community Traveler',
            username: p.user?.username,
            avatarUrl: p.user?.avatarUrl,
          },
          topReview: topComment
            ? {
                content: topComment.content,
                rating: topComment.rating,
                author: topComment.user?.displayName || 'Visitor',
              }
            : null,
          viewCount: p.viewCount,
          favoriteCount: p.favoriteCount,
          commentCount: p.commentCount,
          score,
          tier,
          tierLabel,
          tierColor,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return ranked;
  }
}
