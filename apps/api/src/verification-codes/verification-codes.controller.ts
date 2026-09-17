import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VerificationCodesService } from './verification-codes.service.js';
import { GenerateVerificationCodesDto } from './dto/generate-verification-codes.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApprovedProducerGuard } from '../auth/guards/approved-producer.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard.js';

@Controller('batches/:batchId/verification-codes')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
  ApprovedProducerGuard,
)
export class VerificationCodesController {
  constructor(
    private readonly verificationCodesService: VerificationCodesService,
  ) {}

  @Post('generate')
  @Roles('OWNER', 'ADMIN')
  generate(
    @Req() request: AuthenticatedRequest,
    @Param('batchId') batchId: string,
    @Body() dto: GenerateVerificationCodesDto,
  ) {
    return this.verificationCodesService.generate(
      request.user.producerId!,
      batchId,
      dto.quantity,
    );
  }
}
