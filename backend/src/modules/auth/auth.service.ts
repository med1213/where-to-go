import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ensureRsaKeys } from '../../common/security/keys.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private privateKey: string;
  private publicKey: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    const keys = ensureRsaKeys();
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  async register(dto: RegisterDto) {
    if (!dto.username && !dto.phoneNumber) {
      throw new BadRequestException('Either username or phone number must be provided');
    }

    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: dto.username, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    if (dto.phoneNumber) {
      const existing = await this.prisma.user.findFirst({
        where: { phoneNumber: dto.phoneNumber, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('Phone number is already registered');
      }
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username || null,
        phoneNumber: dto.phoneNumber || null,
        displayName: dto.displayName,
        passwordHash,
        avatarUrl: dto.avatarUrl || null,
        role: Role.USER,
      },
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        displayName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.username, user.phoneNumber, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.identifier },
          { phoneNumber: dto.identifier },
        ],
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username/phone number or password');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username/phone number or password');
    }

    const tokens = await this.generateTokens(user.id, user.username, user.phoneNumber, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }

  // 5-minute leeway cache for concurrent & multi-tab requests during token rotation
  private recentRotations = new Map<
    string,
    Array<{ previousHash: string; newTokens: any; timestamp: number }>
  >();

  async refreshTokens(refreshToken: string) {
    const tokenStr = (refreshToken || '').trim();
    if (!tokenStr) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let matchedUser: any = null;
    const dotCount = (tokenStr.match(/\./g) || []).length;

    // 1. Support Refreshing directly with Access Token (JWT with 2 dots)
    // If client/user provides their expired access token, verify RS-PSS signature
    if (dotCount === 2) {
      try {
        const payload: any = this.jwtService.verify(tokenStr, {
          publicKey: this.publicKey,
          algorithms: ['PS512'],
          ignoreExpiration: true,
        });

        if (payload && payload.sub) {
          const user = await this.prisma.user.findUnique({
            where: { id: payload.sub, deletedAt: null },
          });
          // Ensure user exists and has not been explicitly logged out (refreshTokenHash != null)
          if (user && user.refreshTokenHash) {
            matchedUser = user;
          }
        }
      } catch {
        // Not a valid JWT from our server, continue to refresh token lookup
      }
    }

    // 2. Fast O(1) lookup if token is structured as `${userId}.${secret}` (1 dot)
    if (!matchedUser && dotCount === 1) {
      const [userId, secret] = tokenStr.split('.');
      if (userId && secret) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId, deletedAt: null },
        });
        if (user && user.refreshTokenHash) {
          const isMatch = await argon2.verify(user.refreshTokenHash, secret).catch(() => false);
          if (isMatch) {
            matchedUser = user;
          }
        }

        // Grace period check: multi-token history within 5-minute window
        if (!matchedUser) {
          const history = this.recentRotations.get(userId) || [];
          for (const item of history) {
            if (Date.now() - item.timestamp < 300000) { // 5 minutes
              const isRecentMatch = await argon2.verify(item.previousHash, secret).catch(() => false);
              if (isRecentMatch) {
                return item.newTokens;
              }
            }
          }
        }
      }
    }

    // 3. Fallback: check legacy tokens without dot
    if (!matchedUser && dotCount === 0) {
      const users = await this.prisma.user.findMany({
        where: {
          refreshTokenHash: { not: null },
          deletedAt: null,
        },
      });

      for (const u of users) {
        if (u.refreshTokenHash) {
          const isMatch = await argon2.verify(u.refreshTokenHash, tokenStr).catch(() => false);
          if (isMatch) {
            matchedUser = u;
            break;
          }
        }
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const previousHash = matchedUser.refreshTokenHash;
    const tokens = await this.generateTokens(
      matchedUser.id,
      matchedUser.username,
      matchedUser.phoneNumber,
      matchedUser.role,
    );
    await this.updateRefreshToken(matchedUser.id, tokens.refreshToken);

    // Save in 5-minute grace window cache (keep up to 10 recent rotations)
    if (previousHash) {
      const existingHistory = this.recentRotations.get(matchedUser.id) || [];
      const cleanHistory = existingHistory.filter((r) => Date.now() - r.timestamp < 300000);
      cleanHistory.unshift({
        previousHash,
        newTokens: tokens,
        timestamp: Date.now(),
      });
      this.recentRotations.set(matchedUser.id, cleanHistory.slice(0, 10));
    }

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(
    userId: string,
    username: string | null,
    phoneNumber: string | null,
    role: string,
  ) {
    const payload = {
      sub: userId,
      username,
      phoneNumber,
      role,
    };

    // Sign Access Token with RSA Private Key using PS512 algorithm
    const accessToken = this.jwtService.sign(payload, {
      privateKey: this.privateKey,
      algorithm: 'PS512',
      expiresIn: '15m',
    });

    // Generate secure random refresh token bound to user ID for instant O(1) lookup
    const randomSecret = crypto.randomBytes(32).toString('hex');
    const refreshToken = `${userId}.${randomSecret}`;

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const secretToHash = refreshToken.includes('.') ? refreshToken.split('.')[1] : refreshToken;
    const hash = await argon2.hash(secretToHash);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}
