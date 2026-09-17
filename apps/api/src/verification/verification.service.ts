import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async verify(token: string) {
    const normalizedToken = token.trim();

    // Do not store blank verification attempts.
    if (!normalizedToken) {
      return {
        status: 'UNKNOWN',
        message: 'Verification code not recognized',
      };
    }

    const code = await this.prisma.verificationCode.findUnique({
      where: {
        token: normalizedToken,
      },
      include: {
        batch: {
          include: {
            product: {
              include: {
                producer: {
                  select: {
                    id: true,
                    companyName: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Record unknown/non-existent verification codes.
    if (!code) {
      await this.prisma.verificationEvent.create({
        data: {
          token: normalizedToken,
          result: 'UNKNOWN',
        },
      });

      return {
        status: 'UNKNOWN',
        message: 'Verification code not recognized',
      };
    }

    const now = new Date();

    const isSuspicious =
      code.status !== 'ACTIVE' ||
      code.batch.status === 'SUSPENDED' ||
      code.batch.product.status !== 'ACTIVE' ||
      code.batch.product.producer.status !== 'APPROVED';

    const wasPreviouslyVerified = code.scanCount > 0;

    let status:
      | 'VERIFIED'
      | 'PREVIOUSLY_VERIFIED'
      | 'SUSPICIOUS';

    let message: string;

    if (isSuspicious) {
      status = 'SUSPICIOUS';
      message =
        'This product requires additional verification';
    } else if (wasPreviouslyVerified) {
      status = 'PREVIOUSLY_VERIFIED';
      message =
        'This code has been verified before. If you did not perform the previous verification, check the product and packaging carefully before use or purchase.';
    } else {
      status = 'VERIFIED';
      message = 'Verification code recognized';
    }

    // Update the code and create the verification event atomically.
    const [updatedCode] = await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: {
          id: code.id,
        },
        data: {
          scanCount: {
            increment: 1,
          },
          ...(code.firstScannedAt === null && {
            firstScannedAt: now,
          }),
        },
        select: {
          scanCount: true,
          firstScannedAt: true,
        },
      }),

      this.prisma.verificationEvent.create({
        data: {
          verificationCodeId: code.id,
          token: normalizedToken,
          result: status,
        },
      }),
    ]);

    return {
      status,
      message,

      product: {
        name: code.batch.product.name,
        brand: code.batch.product.brand,
        category: code.batch.product.category,
        size: code.batch.product.size,
        nafdacNumber: code.batch.product.nafdacNumber,
      },

      producer: {
        companyName:
          code.batch.product.producer.companyName,
      },

      batch: {
        batchNumber: code.batch.batchNumber,
        manufacturedAt: code.batch.manufacturedAt,
        expiresAt: code.batch.expiresAt,
      },

      scan: {
        scanCount: updatedCode.scanCount,
        firstScannedAt: updatedCode.firstScannedAt,
      },
    };
  }
}
