import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ConsumerRegisterDto } from './dto/consumer-register.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('consumer/register')
    registerConsumer(@Body() dto: ConsumerRegisterDto) {
    return this.authService.registerConsumer(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

 @UseGuards(JwtAuthGuard)
 @Get('me')
 me(@Req() request: AuthenticatedRequest) {
   return this.authService.getCurrentUser(request.user.userId);
 }
}
