import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiLogService } from './api-log.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Developer - Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('developer/logs')
export class ApiLogController {
  constructor(private readonly logService: ApiLogService) {}

  @Get()
  @ApiOperation({ summary: 'List API requests and logs' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.logService.findAll(tenantId, Number(page) || 1, Number(limit) || 20);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get API usage stats for dashboard' })
  async getStats(@TenantId() tenantId: string) {
    return this.logService.getStats(tenantId);
  }
}
