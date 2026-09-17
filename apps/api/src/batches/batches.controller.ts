import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BatchesService } from './batches.service.js';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApprovedProducerGuard } from '../auth/guards/approved-producer.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';

@Controller()
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  ApprovedProducerGuard,
)
export class BatchesController {
  constructor(
    private readonly batchesService: BatchesService,
  ) {}

  @Post('products/:productId/batches')
  @Roles('OWNER', 'ADMIN')
  create(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body() dto: CreateBatchDto,
  ) {
    return this.batchesService.create(
      request.user.producerId!,
      productId,
      dto,
    );
  }

  @Get('products/:productId/batches')
  @Roles('OWNER', 'ADMIN', 'MEMBER')
  findAll(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.batchesService.findAll(
      request.user.producerId!,
      productId,
    );
  }

  @Get('batches/:batchId')
  @Roles('OWNER', 'ADMIN', 'MEMBER')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('batchId') batchId: string,
  ) {
    return this.batchesService.findOne(
      request.user.producerId!,
      batchId,
    );
  }
}
