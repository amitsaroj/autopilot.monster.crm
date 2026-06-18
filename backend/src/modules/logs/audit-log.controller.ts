import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getLogs(@TenantId() tenantId: string) {
    return this.auditLogService.findByTenant(tenantId);
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform-wide audit logs' })
  @Roles('SUPER_ADMIN')
  async getPlatformLogs() {
    return this.auditLogService.findAll();
  }
}
