import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminLogsService } from './sub-admin-logs.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ResourcePermissions('audit')
@Controller('sub-admin/logs')
export class SubAdminLogsController {
  constructor(private readonly logsService: SubAdminLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant-specific logs' })
  async findAll(@TenantId() tenantId: string, @Query() query: any) {
    return await this.logsService.findAll(tenantId, query);
  }
}
