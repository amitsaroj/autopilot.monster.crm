import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminInternalService } from './admin-internal.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Internal Tools')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/internal')
export class AdminInternalController {
  constructor(private readonly internalService: AdminInternalService) {}

  @Get('system-health')
  @ApiOperation({ summary: 'Get comprehensive system health' })
  async getSystemHealth() {
    return await this.internalService.getSystemHealth();
  }

  @Get('database/status')
  @ApiOperation({ summary: 'Get database connection and migration status' })
  async getDbStatus() {
    return await this.internalService.getDbStatus();
  }
}
