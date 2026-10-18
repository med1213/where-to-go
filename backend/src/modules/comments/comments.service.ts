import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(placeId: string, userId: string, dto: CreateCommentDto) {
    const place = await this.prisma.place.findFirst({
      where: { id: placeId, deletedAt: null },
    });

    if (!place) {
      throw new NotFoundException(`Place with ID '${placeId}' not found`);
    }

    const comment = await this.prisma.comment.create({
      data: {
        placeId,
        userId,
        parentId: dto.parentId || null,
        content: dto.content,
        rating: dto.rating || null,
        images: dto.images || [],
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Update place comment count
    await this.prisma.place.update({
      where: { id: placeId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async findByPlace(placeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    // Only fetch root comments with their nested replies
    const where = { placeId, parentId: null, deletedAt: null };

    const [total, items] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, displayName: true, avatarUrl: true } },
            },
          },
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

  async softDelete(commentId: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID '${commentId}' not found`);
    }

    if (comment.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.prisma.softDeleteComment(commentId);

    // Decrement place comment count
    await this.prisma.place.update({
      where: { id: comment.placeId },
      data: { commentCount: { decrement: 1 } },
    });

    return { success: true, message: 'Comment soft-deleted successfully' };
  }
}
