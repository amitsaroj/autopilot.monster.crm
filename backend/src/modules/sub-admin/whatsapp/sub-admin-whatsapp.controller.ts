import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminWhatsappService } from './sub-admin-whatsapp.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/whatsapp')
export class SubAdminWhatsappController {
  constructor(private readonly whatsappService: SubAdminWhatsappService) {}

  @Get('profiles')
  @ApiOperation({ summary: 'Get WhatsApp business profiles for tenant' })
  async findProfiles(@TenantId() tenantId: string) {
    const data = await this.whatsappService.findProfiles(tenantId);
    return { status: 200, message: 'WhatsApp manifold synchronized', error: false, data };
  }

  @Post('profiles')
  @ApiOperation({ summary: 'Link a new WhatsApp business profile' })
  async linkProfile(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.whatsappService.linkProfile(tenantId, dto);
    return { status: 201, message: 'WhatsApp vector established', error: false, data };
  }
}
