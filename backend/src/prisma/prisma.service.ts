import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Helper to perform soft delete by setting deletedAt = new Date()
   */
  async softDeletePlace(id: string) {
    return this.place.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Helper to restore soft-deleted place
   */
  async restorePlace(id: string) {
    return this.place.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Helper to soft delete comment
   */
  async softDeleteComment(id: string) {
    return this.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Helper to restore soft-deleted comment
   */
  async restoreComment(id: string) {
    return this.comment.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Helper to soft delete user account
   */
  async softDeleteUser(id: string) {
    return this.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Helper to restore user account
   */
  async restoreUser(id: string) {
    return this.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
