import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';
import type { ProductModel } from '@verifyng/database';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    producerId: string,
    dto: CreateProductDto,
  ): Promise<ProductModel> {
    return this.prisma.product.create({
      data: {
        producerId,
        name: dto.name.trim(),
        brand: dto.brand.trim(),
        category: dto.category?.trim(),
        size: dto.size?.trim(),
        barcode: dto.barcode?.trim(),
        nafdacNumber: dto.nafdacNumber?.trim(),
        imageUrl: dto.imageUrl,
      },
    });
  }

  findAll(
    producerId: string,
  ): Promise<ProductModel[]> {
    return this.prisma.product.findMany({
      where: {
        producerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    producerId: string,
    productId: string,
  ): Promise<ProductModel> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        producerId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    producerId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductModel> {
    await this.findOne(producerId, productId);

    return this.prisma.product.update({
      where: {
        id: productId,
        producerId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.brand !== undefined && {
          brand: dto.brand.trim(),
        }),
        ...(dto.category !== undefined && {
          category: dto.category.trim(),
        }),
        ...(dto.size !== undefined && {
          size: dto.size.trim(),
        }),
        ...(dto.barcode !== undefined && {
          barcode: dto.barcode.trim(),
        }),
        ...(dto.nafdacNumber !== undefined && {
          nafdacNumber: dto.nafdacNumber.trim(),
        }),
        ...(dto.imageUrl !== undefined && {
          imageUrl: dto.imageUrl,
        }),
      },
    });
  }
}
