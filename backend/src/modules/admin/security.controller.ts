import {
  Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Security & Compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TENANT_ADMIN')
@Controller('settings/security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  // --- IP Whitelist ---
  @Post('ip-whitelist')
  @ApiOperation({ summary: 'Add IP to whitelist' })
  async addIp(@TenantId() tenantId: string, @Body() body: { ipAddress: string; description?: string }) {
    return this.securityService.addIp(tenantId, body.ipAddress, body.description);
  }

  @Get('ip-whitelist')
  @ApiOperation({ summary: 'Get IP whitelist' })
  async getIps(@TenantId() tenantId: string) {
    return this.securityService.getIps(tenantId);
  }

  @Delete('ip-whitelist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove IP from whitelist' })
  async removeIp(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.securityService.removeIp(tenantId, id);
  }

  // --- Consent ---
  @Post('consent')
  @ApiOperation({ summary: 'Record consent' })
  async recordConsent(@TenantId() tenantId: string, @Body() body: { contactId: string; consentType: string; granted: boolean; source?: string }) {
    return this.securityService.recordConsent(tenantId, body.contactId, body.consentType, body.granted, body.source);
  }

  @Get('consent/:contactId')
  @ApiOperation({ summary: 'Get consent records for a contact' })
  async getConsent(@TenantId() tenantId: string, @Param('contactId') contactId: string) {
    return this.securityService.getConsent(tenantId, contactId);
  }

  @Post('consent/:contactId/revoke')
  @ApiOperation({ summary: 'Revoke consent' })
  async revokeConsent(@TenantId() tenantId: string, @Param('contactId') contactId: string, @Body() body: { consentType: string }) {
    return this.securityService.revokeConsent(tenantId, contactId, body.consentType);
  }

  // --- GDPR ---
  @Get('gdpr/export/:contactId')
  @ApiOperation({ summary: 'Export all data for a contact (GDPR)' })
  async exportData(@TenantId() tenantId: string, @Param('contactId') contactId: string) {
    return this.securityService.exportContactData(tenantId, contactId);
  }
}
