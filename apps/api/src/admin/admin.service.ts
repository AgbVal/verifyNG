import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type {
  ProducerReviewStatus,
} from './dto/update-producer-status.dto.js';

export interface AdminProducerListItem {
  id: string;
  companyName: string;
  cacNumber: string | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  memberships: {
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
    };
  }[];
  _count: {
    products: number;
  };
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findProducers(): Promise<AdminProducerListItem[]> {
  return this.prisma.producer.findMany({
    select: {
      id: true,
      companyName: true,
      cacNumber: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        where: {
          role: 'OWNER',
        },
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              emailVerified: true,
            },
          },
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

  async updateProducerStatus(
    producerId: string,
    status: ProducerReviewStatus,
  ) {
    const producer = await this.prisma.producer.findUnique({
      where: { id: producerId },
      select: {
        id: true,
        companyName: true,
        status: true,
      },
    });

    if (!producer) {
      throw new NotFoundException('Producer not found');
    }

    if (producer.status !== 'PENDING') {
      throw new BadRequestException(
        `Producer application cannot be reviewed from ${producer.status} status`,
      );
    }

    return this.prisma.producer.update({
      where: { id: producer.id },
      data: { status },
      select: {
        id: true,
        companyName: true,
        status: true,
        updatedAt: true,
      },
    });
  }
}
