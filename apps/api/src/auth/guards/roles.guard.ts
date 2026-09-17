import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './jwt-auth.guard.js';
import {
  ROLES_KEY,
  type ProducerRole,
} from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<ProducerRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (
      !request.user.role ||
      !requiredRoles.includes(request.user.role)
    ) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
