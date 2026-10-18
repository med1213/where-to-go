import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlaceStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlacesDto, SortOption } from './dto/query-places.dto';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, role: string, dto: CreatePlaceDto) {
    // Generate unique slug from title
    const baseSlug = dto.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'place';

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;

    const place = await this.prisma.place.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        provinceId: dto.provinceId || null,
        districtId: dto.districtId || null,
        title: dto.title,
        slug,
        description: dto.description,
        province: dto.province,
        district: dto.district || null,
        address: dto.address || null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        priceRange: dto.priceRange || null,
        priceLao: dto.priceLao || null,
        priceForeigner: dto.priceForeigner || null,
        openingHours: dto.openingHours || Prisma.DbNull,
        contactInfo: dto.contactInfo || Prisma.DbNull,
        status: role === 'ADMIN' ? PlaceStatus.APPROVED : PlaceStatus.PENDING,
      },
    });

    if (dto.mediaUrls && dto.mediaUrls.length > 0) {
      await this.prisma.placeMedia.createMany({
        data: dto.mediaUrls.map((url, idx) => ({
          placeId: place.id,
          url,
          sortOrder: idx,
          isCover: idx === 0,
        })),
      });
    }

    return this.prisma.place.findUnique({
      where: { id: place.id },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async findPublic(query: QueryPlacesDto) {
    const {
      q,
      search,
      province,
      provinceId,
      districtId,
      category,
      categoryId,
      sort,
      page = 1,
      limit = 20,
      offset,
    } = query;

    const skip = offset !== undefined ? offset : (page - 1) * limit;

    const where: Prisma.PlaceWhereInput = {
      status: PlaceStatus.APPROVED,
      deletedAt: null, // Global Soft-Delete filter
    };

    // 1. Province filter
    const parsedProvId = provinceId || (province && !isNaN(Number(province)) ? Number(province) : undefined);
    if (parsedProvId) {
      where.provinceId = parsedProvId;
    } else if (province && province !== 'ALL') {
      where.OR = [
        { province: { contains: province, mode: 'insensitive' } },
        { provinceRel: { code: { contains: province, mode: 'insensitive' } } },
        { provinceRel: { slug: { contains: province, mode: 'insensitive' } } },
      ];
    }

    // 2. District filter
    if (districtId) {
      where.districtId = districtId;
    }

    // 3. Category filter
    const parsedCatId = categoryId || (category && !isNaN(Number(category)) ? Number(category) : undefined);
    if (parsedCatId) {
      where.categoryId = parsedCatId;
    } else if (category && typeof category === 'string') {
      where.category = { slug: category };
    }

    // 4. Keyword search (supports q or search)
    const keyword = search || q;
    if (keyword) {
      const searchConditions = [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { description: { contains: keyword, mode: 'insensitive' as const } },
        { address: { contains: keyword, mode: 'insensitive' as const } },
        { province: { contains: keyword, mode: 'insensitive' as const } },
        { district: { contains: keyword, mode: 'insensitive' as const } },
        { provinceRel: { code: { contains: keyword, mode: 'insensitive' as const } } },
        { provinceRel: { nameEn: { contains: keyword, mode: 'insensitive' as const } } },
        { provinceRel: { nameLo: { contains: keyword, mode: 'insensitive' as const } } },
        { provinceRel: { slug: { contains: keyword, mode: 'insensitive' as const } } },
        { districtRel: { code: { contains: keyword, mode: 'insensitive' as const } } },
        { districtRel: { nameEn: { contains: keyword, mode: 'insensitive' as const } } },
        { districtRel: { nameLo: { contains: keyword, mode: 'insensitive' as const } } },
        { category: { name: { contains: keyword, mode: 'insensitive' as const } } },
      ];
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { OR: searchConditions },
      ];
    }

    // 5. Recency / Timeframe filtering: recent, 1 (1m / this month), 3 (3m), 6 (6m), 9 (9m)
    const sortStr = (sort || '').toString().toLowerCase().trim();
    let dateLimit: Date | null = null;
    if (sortStr === '1' || sortStr === '1m' || sortStr === 'month') {
      dateLimit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    } else if (sortStr === '3' || sortStr === '3m') {
      dateLimit = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days
    } else if (sortStr === '6' || sortStr === '6m') {
      dateLimit = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000); // 180 days
    } else if (sortStr === '9' || sortStr === '9m') {
      dateLimit = new Date(Date.now() - 270 * 24 * 60 * 60 * 1000); // 270 days
    }

    if (dateLimit) {
      where.createdAt = { gte: dateLimit };
    }

    // 6. Ordering
    let orderBy: Prisma.PlaceOrderByWithRelationInput = { favoriteCount: 'desc' };
    if (
      sortStr === 'recent' ||
      sortStr === '1' ||
      sortStr === '1m' ||
      sortStr === 'month' ||
      sortStr === '3' ||
      sortStr === '3m' ||
      sortStr === '6' ||
      sortStr === '6m' ||
      sortStr === '9' ||
      sortStr === '9m'
    ) {
      orderBy = { createdAt: 'desc' };
    } else if (sortStr === 'featured') {
      orderBy = { isFeatured: 'desc' };
    }

    const [total, items] = await Promise.all([
      this.prisma.place.count({ where }),
      this.prisma.place.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          provinceRel: true,
          districtRel: true,
          media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          _count: { select: { comments: { where: { deletedAt: null } }, favorites: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySlugOrId(slugOrId: string) {
    const place = await this.prisma.place.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        status: PlaceStatus.APPROVED,
        deletedAt: null,
      },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
        _count: {
          select: {
            comments: { where: { deletedAt: null } },
            favorites: true,
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundException(`Place '${slugOrId}' not found or has not been approved yet`);
    }

    // Atomically increment view count
    await this.prisma.place.update({
      where: { id: place.id },
      data: { viewCount: { increment: 1 } },
    });

    return place;
  }

  async findMyPlaces(userId: string) {
    return this.prisma.place.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        _count: {
          select: {
            comments: { where: { deletedAt: null } },
            favorites: true,
          },
        },
      },
    });
  }

  async update(placeId: string, userId: string, role: string, dto: UpdatePlaceDto) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID '${placeId}' not found`);
    }

    if (place.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this place');
    }

    const { mediaUrls, ...updateData } = dto;

    const updated = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        ...updateData,
        // If regular user edits, keep status or set to PENDING if title/content changed significantly
        status: role === Role.ADMIN ? place.status : PlaceStatus.PENDING,
      },
      include: {
        category: true,
        provinceRel: true,
        districtRel: true,
        media: true,
      },
    });

    if (mediaUrls && Array.isArray(mediaUrls)) {
      await this.prisma.placeMedia.deleteMany({ where: { placeId } });
      await this.prisma.placeMedia.createMany({
        data: mediaUrls.map((url: string, idx: number) => ({
          placeId,
          url,
          sortOrder: idx,
          isCover: idx === 0,
        })),
      });
    }

    return updated;
  }

  async softDelete(placeId: string, userId: string, role: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID '${placeId}' not found`);
    }

    if (place.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this place');
    }

    return this.prisma.softDeletePlace(placeId);
  }
}
