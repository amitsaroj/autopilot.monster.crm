import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { PlanFeature, ResourcePermissions, TenantId, CurrentUser } from '../../common/decorators';
import { WhatsappConsentService } from './whatsapp-consent.service';
import type { IRequestContext } from '../../common/interfaces/request-context.interface';
import {
  ImportWhatsappConsentDto,
  ListSuppressedWhatsappConsentDto,
  ListWhatsappConsentDto,
  ReconsentWhatsappConsentDto,
  RecordWhatsappConsentDto,
  UpdateContactSuppressionDto,
  UpdateWhatsappPreferencesDto,
} from './dto/whatsapp-consent.dto';
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp/consent')
export class WhatsappConsentController {
  constructor(private readonly consent: WhatsappConsentService) {}
  @Get() list(@TenantId() tenantId: string, @Query() filters: ListWhatsappConsentDto) {
    return this.consent.list(tenantId, filters);
  }
  @Get('suppressed') listSuppressed(
    @TenantId() tenantId: string,
    @Query() pagination: ListSuppressedWhatsappConsentDto,
  ) {
    return this.consent.listSuppressed(tenantId, pagination);
  }
  @Post(':phone/re-consent') reconsent(
    @TenantId() tenantId: string,
    @Param('phone') phone: string,
    @Body() dto: ReconsentWhatsappConsentDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.consent.reconsent(tenantId, phone, dto, user.userId);
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
  @Post('import') importRecords(
    @TenantId() tenantId: string,
    @Body() dto: ImportWhatsappConsentDto,
    @CurrentUser() user: IRequestContext,
  ) {
    return this.consent.recordMany(tenantId, dto.records, user.userId);
  }
  @Post('contact-suppression') updateContactSuppression(
    @TenantId() tenantId: string,
    @Body() dto: UpdateContactSuppressionDto,
  ) {
    return this.consent.updateContactSuppression(tenantId, dto);
  }
}
