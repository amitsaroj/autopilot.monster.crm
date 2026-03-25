import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminHealthService } from './admin-health.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/health')
export class AdminHealthController {
  constructor(private readonly healthService: AdminHealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  async getHealth() {
    const data = await this.healthService.getHealth();
    return {
      status: 200,
      message: 'System health retrieved',
      error: false,
      data,
    };
  }
}
