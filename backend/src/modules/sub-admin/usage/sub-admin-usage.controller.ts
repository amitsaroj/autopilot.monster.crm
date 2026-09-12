import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminUsageService } from './sub-admin-usage.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Usage')
@ApiBearerAuth()
@ResourcePermissions('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/usage')
export class SubAdminUsageController {
  constructor(private readonly usageService: SubAdminUsageService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get tenant usage summary' })
  async getUsageSummary(@TenantId() tenantId: string) {
    return await this.usageService.getUsageSummary(tenantId);
  }
}
