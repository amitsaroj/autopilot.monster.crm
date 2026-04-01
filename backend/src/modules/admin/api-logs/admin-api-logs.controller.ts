import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminApiLogsService } from './admin-api-logs.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / API Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/api-logs')
export class AdminApiLogsController {
  constructor(private readonly adminApiLogsService: AdminApiLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all API request logs' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'statusCode', required: false })
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('method') method?: string,
    @Query('statusCode') statusCode?: number,
  ) {
    const data = await this.adminApiLogsService.findAll({ tenantId, method, statusCode });
    return {
      status: 200,
      message: 'API logs retrieved',
      error: false,
      data,
    };
  }
}
