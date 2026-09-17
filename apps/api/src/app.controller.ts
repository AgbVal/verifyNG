import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './database/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('database-check')
  async getDatabaseCheck() {
    const producerCount = await this.prisma.producer.count();

    return {
      status: 'ok',
      database: 'connected',
      producerCount,
    };
  }
}
