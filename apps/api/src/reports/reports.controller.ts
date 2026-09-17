import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard.js';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator.js';

@Controller()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Post('reports')
  create(
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(dto);
  }

  @Get('admin/reports')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @PlatformRoles(
    'REVIEWER',
    'OPERATIONS_ADMIN',
    'SUPER_ADMIN',
  )
  findAll() {
    return this.reportsService.findAll();
  }
}
