import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, PrismaPg } from '@verifyng/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
