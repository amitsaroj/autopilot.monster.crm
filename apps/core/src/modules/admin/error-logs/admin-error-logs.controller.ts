import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminErrorLogsService } from './admin-error-logs.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Error Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/logs/errors')
export class AdminErrorLogsController {
  constructor(private readonly errorLogsService: AdminErrorLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system error logs' })
  async getLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search?: string,
  ) {
    const data = await this.errorLogsService.getLogs({ page, limit, search });
    return { status: 200, message: 'Error logs retrieved', error: false, data };
  }
}
