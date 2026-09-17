import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module.js';
import { ProductsModule } from './products/products.module.js';
import { BatchesModule } from './batches/batches.module.js';
import { VerificationCodesModule } from './verification-codes/verification-codes.module.js';
import { VerificationModule } from './verification/verification.module.js';
import { ReportsModule } from './reports/reports.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    AdminModule,
    ProductsModule,
    VerificationCodesModule,
    BatchesModule,
    VerificationModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
