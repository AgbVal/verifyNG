import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import type { VerificationCodeModel } from '@verifyng/database';

@Injectable()
export class VerificationCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(
    producerId: string,
    batchId: string,
    quantity: number,
  ): Promise<VerificationCodeModel[]> {
    const batch = await this.prisma.batch.findFirst({
      where: {
        id: batchId,
        product: {
          producerId,
        },
      },
      select: {
        id: true,
        quantity: true,
        status: true,
        _count: {
          select: {
            verificationCodes: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.status === 'SUSPENDED' || batch.status === 'CLOSED') {
      throw new BadRequestException(
        'Verification codes cannot be generated for this batch',
      );
    }

    const existingCodeCount = batch._count.verificationCodes;
    const remainingCapacity =
      batch.quantity - existingCodeCount;

    if (quantity > remainingCapacity) {
      throw new BadRequestException(
        `Only ${remainingCapacity} verification codes can still be generated for this batch`,
      );
    }

    const codes = Array.from(
      { length: quantity },
      () => ({
        batchId: batch.id,
        token: randomBytes(24).toString('base64url'),
      }),
    );

    await this.prisma.verificationCode.createMany({
      data: codes,
    });

    return this.prisma.verificationCode.findMany({
      where: {
        token: {
          in: codes.map((code) => code.token),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
