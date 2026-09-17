import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AccountType =
  | 'CONSUMER'
  | 'PRODUCER'
  | 'PLATFORM_ADMIN';

export interface AuthenticatedUser {
  userId: string;
  accountType: AccountType;
  producerId: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

interface JwtPayload {
  sub: string;
  accountType: AccountType;
  producerId: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      if (
        !payload.sub ||
        ![
          'CONSUMER',
          'PRODUCER',
          'PLATFORM_ADMIN',
        ].includes(payload.accountType)
      ) {
        throw new UnauthorizedException();
      }

      request.user = {
        userId: payload.sub,
        accountType: payload.accountType,
        producerId: payload.producerId ?? null,
        role: payload.role ?? null,
      };

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
