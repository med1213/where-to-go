import { Injectable, NotFoundException } from '@nestjs/common';
import { FavoriteType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(placeId: string, userId: string, dto: ToggleFavoriteDto) {
    const place = await this.prisma.place.findFirst({
      where: { id: placeId, deletedAt: null },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID '${placeId}' not found`);
    }

    const listType = dto.listType || FavoriteType.WANNA_GO;

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_placeId_listType: {
          userId,
          placeId,
          listType,
        },
      },
    });

    if (existing) {
      // User is toggling it off (remove)
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });

      await this.prisma.place.update({
        where: { id: placeId },
        data: { favoriteCount: { decrement: 1 } },
      });

      return {
        isFavorited: false,
        listType,
        message: 'Removed from your list',
      };
    } else {
      // User is toggling it on (add)
      await this.prisma.favorite.create({
        data: {
          userId,
          placeId,
          listType,
          personalNote: dto.personalNote || null,
        },
      });

      await this.prisma.place.update({
        where: { id: placeId },
        data: { favoriteCount: { increment: 1 } },
      });

      return {
        isFavorited: true,
        listType,
        message: listType === FavoriteType.WANNA_GO ? 'Added to your "I Wanna Go" bucket list!' : 'Added to favorites!',
      };
    }
  }

  async getMyBucketList(userId: string, listType?: FavoriteType) {
    return this.prisma.favorite.findMany({
      where: {
        userId,
        listType: listType || FavoriteType.WANNA_GO,
        place: { deletedAt: null },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        place: {
          include: {
            category: true,
            media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
  }

  async checkStatus(placeId: string, userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        placeId,
        userId,
      },
    });

    return {
      isWannaGo: favorites.some((f) => f.listType === FavoriteType.WANNA_GO),
      isFavorite: favorites.some((f) => f.listType === FavoriteType.FAVORITE),
      isVisited: favorites.some((f) => f.listType === FavoriteType.VISITED),
    };
  }
}
