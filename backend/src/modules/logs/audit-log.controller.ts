import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('logs/audit')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getLogs(@TenantId() tenantId: string) {
    const data = await this.auditLogService.findByTenant(tenantId);
    return {
      status: 200,
      message: 'Audit logs retrieved',
      error: false,
      data,
    };
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform-wide audit logs' })
  @Roles('SUPER_ADMIN')
  async getPlatformLogs() {
    const data = await this.auditLogService.findAll();
    return {
      status: 200,
      message: 'Platform audit logs retrieved',
      error: false,
      data,
    };
  }
}
