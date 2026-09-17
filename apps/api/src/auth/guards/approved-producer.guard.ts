import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { AuthenticatedRequest } from './jwt-auth.guard.js';

@Injectable()
export class ApprovedProducerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user.producerId) {
      throw new ForbiddenException(
      'Producer account is required for this operation',
      );
    }

    const producer = await this.prisma.producer.findUnique({
      where: {
        id: request.user.producerId,
      },
      select: {
        status: true,
      },
    });

    if (!producer) {
      throw new ForbiddenException('Producer account not found');
    }

    if (producer.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Producer account must be approved to perform this action',
      );
    }

    return true;
  }
}
