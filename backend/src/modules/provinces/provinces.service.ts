import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@Injectable()
export class ProvincesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.province.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            districts: { where: { deletedAt: null } },
            places: { where: { status: 'APPROVED', deletedAt: null } },
          },
        },
      },
    });
  }

  async findOne(idOrSlug: string) {
    const isNum = !isNaN(Number(idOrSlug));
    const where = isNum
      ? { id: Number(idOrSlug), deletedAt: null }
      : { slug: idOrSlug, deletedAt: null };

    const province = await this.prisma.province.findFirst({
      where,
      include: {
        districts: {
          where: { deletedAt: null },
          orderBy: { id: 'asc' },
          include: {
            _count: {
              select: {
                places: { where: { status: 'APPROVED', deletedAt: null } },
              },
            },
          },
        },
        places: {
          where: { status: 'APPROVED', deletedAt: null },
          include: {
            category: true,
            media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!province) {
      throw new NotFoundException(`Province '${idOrSlug}' not found`);
    }

    return province;
  }

  async create(dto: CreateProvinceDto) {
    const existing = await this.prisma.province.findFirst({
      where: {
        OR: [{ code: dto.code }, { slug: dto.slug }],
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException(`Province with code '${dto.code}' or slug '${dto.slug}' already exists`);
    }

    return this.prisma.province.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateProvinceDto) {
    const province = await this.prisma.province.findUnique({ where: { id } });
    if (!province || province.deletedAt) {
      throw new NotFoundException(`Province #${id} not found`);
    }

    return this.prisma.province.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: number) {
    const province = await this.prisma.province.findUnique({ where: { id } });
    if (!province) {
      throw new NotFoundException(`Province #${id} not found`);
    }

    return this.prisma.province.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- District Operations ---
  async getDistricts(provinceId: number) {
    return this.prisma.district.findMany({
      where: { provinceId, deletedAt: null },
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: {
            places: { where: { status: 'APPROVED', deletedAt: null } },
          },
        },
      },
    });
  }

  async createDistrict(provinceId: number, dto: CreateDistrictDto) {
    const province = await this.prisma.province.findUnique({ where: { id: provinceId } });
    if (!province || province.deletedAt) {
      throw new NotFoundException(`Province #${provinceId} not found`);
    }

    const existing = await this.prisma.district.findUnique({
      where: {
        provinceId_slug: {
          provinceId,
          slug: dto.slug,
        },
      },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(`District with slug '${dto.slug}' already exists in this province`);
    }

    if (existing && existing.deletedAt) {
      return this.prisma.district.update({
        where: { id: existing.id },
        data: {
          nameLo: dto.nameLo,
          nameEn: dto.nameEn,
          code: dto.code || null,
          deletedAt: null,
        },
      });
    }

    return this.prisma.district.create({
      data: {
        provinceId,
        slug: dto.slug,
        code: dto.code || null,
        nameLo: dto.nameLo,
        nameEn: dto.nameEn,
      },
    });
  }

  async updateDistrict(districtId: number, dto: UpdateDistrictDto) {
    const district = await this.prisma.district.findUnique({ where: { id: districtId } });
    if (!district || district.deletedAt) {
      throw new NotFoundException(`District #${districtId} not found`);
    }

    return this.prisma.district.update({
      where: { id: districtId },
      data: dto,
    });
  }

  async deleteDistrict(districtId: number) {
    const district = await this.prisma.district.findUnique({ where: { id: districtId } });
    if (!district) {
      throw new NotFoundException(`District #${districtId} not found`);
    }

    return this.prisma.district.update({
      where: { id: districtId },
      data: { deletedAt: new Date() },
    });
  }
}
