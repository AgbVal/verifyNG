import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service.js';
import type { AuthenticatedRequest } from './jwt-auth.guard.js';
import {
  PLATFORM_ROLES_KEY,
  type PlatformRole,
} from '../decorators/platform-roles.decorator.js';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = await this.prisma.user.findUnique({
      where: {
        id: request.user.userId,
      },
      select: {
        status: true,
        platformRole: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Platform access denied');
    }

    if (!user.platformRole) {
      throw new ForbiddenException(
        'Platform administrator access required',
      );
    }

    const requiredRoles =
      this.reflector.getAllAndOverride<PlatformRole[]>(
        PLATFORM_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      !requiredRoles.includes(user.platformRole)
    ) {
      throw new ForbiddenException(
        'You do not have permission to perform this platform operation',
      );
    }

    return true;
  }
}
