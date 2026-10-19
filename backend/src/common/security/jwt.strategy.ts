import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ensureRsaKeys } from './keys.util';
import { TokenBlacklistService } from '../../modules/auth/token-blacklist.service';

export interface JwtPayload {
  sub: string;
  username?: string | null;
  phoneNumber?: string | null;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private blacklistService: TokenBlacklistService,
  ) {
    const { publicKey } = ensureRsaKeys();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['PS512'],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // 1. Instant Blacklist Check
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      const isRevoked = await this.blacklistService.isTokenRevoked(token);
      if (isRevoked) {
        throw new UnauthorizedException('Token has been revoked/logged out. Please log in again.');
      }
    }

    // 2. Fetch user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        phoneNumber: true,
        displayName: true,
        role: true,
        avatarUrl: true,
        lastLogoutAt: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User account no longer active or has been deleted');
    }

    // 3. Double-Lock: Check if token was issued prior to user's last logout
    if (user.lastLogoutAt && payload.iat) {
      const tokenIssuedAtMs = payload.iat * 1000;
      const lastLogoutAtMs = user.lastLogoutAt.getTime();
      // Allow 2-second grace tolerance for clock skew
      if (tokenIssuedAtMs + 2000 < lastLogoutAtMs) {
        throw new UnauthorizedException('Session terminated by logout. Please log in again.');
      }
    }

    return user;
  }
}

