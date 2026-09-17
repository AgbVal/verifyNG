import { Module } from '@nestjs/common';
import { VerificationCodesController } from './verification-codes.controller.js';
import { VerificationCodesService } from './verification-codes.service.js';

@Module({
  controllers: [VerificationCodesController],
  providers: [VerificationCodesService],
})
export class VerificationCodesModule {}
