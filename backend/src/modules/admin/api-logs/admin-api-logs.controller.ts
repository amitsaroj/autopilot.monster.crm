import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminApiLogsService } from './admin-api-logs.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / API Logs')
@ResourcePermissions('admin')
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
    return await this.adminApiLogsService.findAll({ tenantId, method, statusCode });
  }
}
