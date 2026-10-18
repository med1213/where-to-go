import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findAllAdmin() {
    return this.prisma.banner.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findById(id: string) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!banner) {
      throw new NotFoundException(`Banner with id ${id} not found`);
    }
    return banner;
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        titleLo: dto.titleLo,
        titleEn: dto.titleEn,
        subtitleLo: dto.subtitleLo,
        subtitleEn: dto.subtitleEn,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        placeId: dto.placeId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.findById(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async toggleActive(id: string) {
    const banner = await this.findById(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        isActive: !banner.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
