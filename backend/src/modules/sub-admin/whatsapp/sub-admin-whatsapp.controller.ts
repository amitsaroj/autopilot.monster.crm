import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminWhatsappService } from './sub-admin-whatsapp.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / WhatsApp')
@ApiBearerAuth()
@ResourcePermissions('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/whatsapp')
export class SubAdminWhatsappController {
  constructor(private readonly whatsappService: SubAdminWhatsappService) {}

  @Get('profiles')
  @ApiOperation({ summary: 'Get WhatsApp business profiles for tenant' })
  async findProfiles(@TenantId() tenantId: string) {
    return await this.whatsappService.findProfiles(tenantId);
  }

  @Post('profiles')
  @ApiOperation({ summary: 'Link a new WhatsApp business profile' })
  async linkProfile(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.whatsappService.linkProfile(tenantId, dto);
  }
}
