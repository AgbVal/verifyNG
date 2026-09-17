import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type {
  CreateReportDto,
  ReportReason,
} from './dto/create-report.dto.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto) {
    const token = dto.token?.trim() || null;
    const description = dto.description?.trim() || null;

    if (!token && !description) {
      throw new BadRequestException(
        'Provide a verification token or report description',
      );
    }

    let verificationCodeId: string | null = null;

    if (token) {
      const verificationCode =
        await this.prisma.verificationCode.findUnique({
          where: {
            token,
          },
          select: {
            id: true,
          },
        });

      verificationCodeId =
        verificationCode?.id ?? null;
    }

    return this.prisma.suspiciousProductReport.create({
      data: {
        verificationCodeId,
        token,
        reason: dto.reason as ReportReason,
        description,
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return await  this.prisma.suspiciousProductReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        verificationCode: {
          select: {
            id: true,
            token: true,
            batch: {
              select: {
                batchNumber: true,
                product: {
                  select: {
                    name: true,
                    brand: true,
                    producer: {
                      select: {
                        companyName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

