import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            places: {
              where: { status: 'APPROVED', deletedAt: null },
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, deletedAt: null },
      include: {
        places: {
          where: { status: 'APPROVED', deletedAt: null },
          include: {
            media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
            user: { select: { id: true, displayName: true, avatarUrl: true } },
            provinceRel: true,
            districtRel: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { slug: dto.slug, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon || null,
        description: dto.description || null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug: dto.slug, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
