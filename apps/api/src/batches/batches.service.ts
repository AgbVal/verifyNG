import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { CreateBatchDto } from './dto/create-batch.dto.js';
import type { BatchModel } from '@verifyng/database';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    producerId: string,
    productId: string,
    dto: CreateBatchDto,
  ): Promise<BatchModel> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        producerId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const manufacturedAt = new Date(dto.manufacturedAt);
    const expiresAt = new Date(dto.expiresAt);

    if (expiresAt <= manufacturedAt) {
      throw new BadRequestException(
        'Expiry date must be later than manufacturing date',
      );
    }

    const batchNumber = dto.batchNumber.trim();

    if (!batchNumber) {
      throw new BadRequestException(
        'Batch number cannot be empty',
      );
    }

    const existingBatch = await this.prisma.batch.findUnique({
      where: {
        productId_batchNumber: {
          productId,
          batchNumber,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingBatch) {
      throw new ConflictException(
        'A batch with this batch number already exists for this product',
      );
    }

    return this.prisma.batch.create({
      data: {
        productId,
        batchNumber,
        manufacturedAt,
        expiresAt,
        quantity: dto.quantity,
      },
    });
  }

  async findAll(
    producerId: string,
    productId: string,
  ): Promise<BatchModel[]> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        producerId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.batch.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    producerId: string,
    batchId: string,
  ): Promise<BatchModel> {
    const batch = await this.prisma.batch.findFirst({
      where: {
        id: batchId,
        product: {
          producerId,
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }
}
