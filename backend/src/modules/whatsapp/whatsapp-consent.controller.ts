import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { PlanFeature, ResourcePermissions, TenantId, CurrentUser } from '../../common/decorators';
import { WhatsappConsentService } from './whatsapp-consent.service';
import type { IRequestContext } from '../../common/interfaces/request-context.interface';
import { RecordWhatsappConsentDto, UpdateWhatsappPreferencesDto } from './dto/whatsapp-consent.dto';
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp/consent')
export class WhatsappConsentController {
  constructor(private readonly consent: WhatsappConsentService) {}
  @Get() list(@TenantId() tenantId: string) {
    return this.consent.list(tenantId);
  }
  @Get(':phone/preferences') preferences(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
  ) {
    return this.consent.getPreferences(tenantId, phone);
  }
  @Patch(':phone/preferences') updatePreferences(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: UpdateWhatsappPreferencesDto,
  ) {
    return this.consent.updatePreferences(tenantId, phone, dto);
  }
  @Post() record(
    @TenantId() tenantId: string,
    @Body() dto: RecordWhatsappConsentDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.consent.record(tenantId, dto, user.userId);
  }
}
