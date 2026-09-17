import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApprovedProducerGuard } from '../auth/guards/approved-producer.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';

@Controller('products')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  ApprovedProducerGuard,
)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(
      request.user.producerId!,
      dto,
    );
  }

  @Get()
  @Roles('OWNER', 'ADMIN', 'MEMBER')
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.productsService.findAll(
      request.user.producerId!,
    );
  }

  @Get(':productId')
  @Roles('OWNER', 'ADMIN', 'MEMBER')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.productsService.findOne(
      request.user.producerId!,
      productId,
    );
  }

  @Patch(':productId')
  @Roles('OWNER', 'ADMIN')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(
      request.user.producerId!,
      productId,
      dto,
    );
  }
}
