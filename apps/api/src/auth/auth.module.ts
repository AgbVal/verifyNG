import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ApprovedProducerGuard } from './guards/approved-producer.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PlatformAdminGuard } from './guards/platform-admin.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '15m',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    ApprovedProducerGuard,
    PlatformAdminGuard,
  ],
})
export class AuthModule {}
