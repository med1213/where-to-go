import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private blacklistedHashes = new Set<string>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadActiveBlacklist();
    // Run cleanup every 15 minutes
    setInterval(() => this.cleanupExpiredTokens(), 15 * 60 * 1000);
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  /**
   * Revoke and blacklist an Access Token immediately
   */
  async revokeToken(
    rawToken: string,
    options?: { userId?: string; username?: string; reason?: string; expiresAt?: Date }
  ): Promise<void> {
    if (!rawToken || typeof rawToken !== 'string') return;
    const cleanToken = rawToken.replace(/^Bearer\s+/i, '').trim();
    if (!cleanToken) return;

    const tokenHash = this.hashToken(cleanToken);
    this.blacklistedHashes.add(tokenHash);

    // Default expiry: 60 minutes from now (covers 15m access token lifetime + safe buffer)
    const exp = options?.expiresAt || new Date(Date.now() + 60 * 60 * 1000);

    try {
      await this.prisma.revokedToken.upsert({
        where: { tokenHash },
        update: {
          expiresAt: exp,
          userId: options?.userId,
          username: options?.username,
          reason: options?.reason || 'USER_LOGOUT',
        },
        create: {
          tokenHash,
          expiresAt: exp,
          userId: options?.userId,
          username: options?.username,
          reason: options?.reason || 'USER_LOGOUT',
        },
      });
      this.logger.log(
        `🔒 Token revoked & blacklisted in DB (User: ${options?.username || options?.userId || 'unknown'}, Hash: ${tokenHash.slice(0, 10)}...)`
      );
    } catch (err) {
      this.logger.error(`Failed to persist revoked token in database`, err);
    }
  }

  /**
   * Check if an Access Token has been blacklisted/revoked
   */
  async isTokenRevoked(rawToken: string): Promise<boolean> {
    if (!rawToken || typeof rawToken !== 'string') return false;
    const cleanToken = rawToken.replace(/^Bearer\s+/i, '').trim();
    if (!cleanToken) return false;

    const tokenHash = this.hashToken(cleanToken);

    // 1. Fast in-memory check (0ms)
    if (this.blacklistedHashes.has(tokenHash)) {
      return true;
    }

    // 2. Database lookup
    try {
      const revoked = await this.prisma.revokedToken.findUnique({
        where: { tokenHash },
      });

      if (revoked) {
        if (revoked.expiresAt > new Date()) {
          this.blacklistedHashes.add(tokenHash);
          return true;
        } else {
          // Token expired naturally
          await this.prisma.revokedToken.delete({ where: { tokenHash } }).catch(() => {});
          return false;
        }
      }
    } catch (err) {
      this.logger.error(`Error querying revoked token from database`, err);
    }

    return false;
  }

  private async loadActiveBlacklist() {
    try {
      const now = new Date();
      const activeRevocations = await this.prisma.revokedToken.findMany({
        where: { expiresAt: { gt: now } },
        select: { tokenHash: true },
      });

      for (const item of activeRevocations) {
        this.blacklistedHashes.add(item.tokenHash);
      }
      this.logger.log(`Loaded ${this.blacklistedHashes.size} active blacklisted tokens into memory.`);
    } catch (err: any) {
      this.logger.warn(`Could not preload revoked tokens: ${err.message}`);
    }
  }

  private async cleanupExpiredTokens() {
    try {
      const now = new Date();
      const res = await this.prisma.revokedToken.deleteMany({
        where: { expiresAt: { lte: now } },
      });
      if (res.count > 0) {
        this.logger.log(`Cleaned up ${res.count} expired tokens from blacklist.`);
      }
    } catch (err: any) {
      this.logger.warn(`Error cleaning up expired tokens: ${err.message}`);
    }
  }
}
