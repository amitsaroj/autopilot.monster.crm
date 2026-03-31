import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminInternalService } from './admin-internal.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Internal Tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/internal')
export class AdminInternalController {
  constructor(private readonly internalService: AdminInternalService) {}

  @Get('system-health')
  @ApiOperation({ summary: 'Get comprehensive system health' })
  async getSystemHealth() {
    const data = await this.internalService.getSystemHealth();
    return { status: 200, message: 'System vitals synchronized', error: false, data };
  }

  @Get('database/status')
  @ApiOperation({ summary: 'Get database connection and migration status' })
  async getDbStatus() {
    const data = await this.internalService.getDbStatus();
    return { status: 200, message: 'Database manifold status retrieved', error: false, data };
  }
}
