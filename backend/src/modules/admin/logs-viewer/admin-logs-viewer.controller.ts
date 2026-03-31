import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminLogsViewerService } from './admin-logs-viewer.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Logs Viewer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/logs-viewer')
export class AdminLogsViewerController {
  constructor(private readonly logsService: AdminLogsViewerService) {}

  @Get('unified')
  @ApiOperation({ summary: 'Get unified logs stream' })
  async getUnifiedLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.logsService.getUnifiedLogs({ page, limit, type, search });
    return { status: 200, message: 'Unified logs retrieved', error: false, data };
  }
}
