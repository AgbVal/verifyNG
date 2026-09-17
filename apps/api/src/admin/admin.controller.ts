import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  AdminService,
  type AdminProducerListItem,
} from './admin.service.js';
import { UpdateProducerStatusDto } from './dto/update-producer-status.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard.js';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('producers/:producerId/status')
  @PlatformRoles('REVIEWER', 'OPERATIONS_ADMIN', 'SUPER_ADMIN')
  @Get('producers')
  @PlatformRoles('REVIEWER', 'OPERATIONS_ADMIN', 'SUPER_ADMIN')
  findProducers(): Promise<AdminProducerListItem[]> {
    return this.adminService.findProducers();
  }
  updateProducerStatus(
    @Param('producerId') producerId: string,
    @Body() dto: UpdateProducerStatusDto,
  ) {
    return this.adminService.updateProducerStatus(
      producerId,
      dto.status,
    );
  }
}
