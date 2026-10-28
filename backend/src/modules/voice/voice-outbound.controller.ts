import { Body, Controller, Get, Post, Put, Param, Query, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TenantId, ResourcePermissions, Public, Permissions, CurrentUser } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';
import { EVENT_NAMES } from '../../events/event.constants';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { VoiceRuntimeService } from './voice-runtime.service';
import { VoiceAudienceService } from './voice-audience.service';
import { VoiceProviderRegistry } from './providers/voice-provider.registry';
import { ProviderConfigService } from './providers/provider-config.service';

class ProviderDto {
  @IsObject() credentials!: Record<string, string>;
  @IsObject() settings!: Record<string, any>;
}
class ImportDto {
  @IsString() @MaxLength(3000000) csv!: string;
  @IsObject() mapping!: Record<string, string>;
  @IsBoolean() @IsOptional() commit?: boolean;
}

@Controller('voice/outbound')
@ResourcePermissions('voice')
export class VoiceOutboundController {
  constructor(private readonly runtime: VoiceRuntimeService, private readonly audience: VoiceAudienceService,
    private readonly providers: VoiceProviderRegistry, private readonly configs: ProviderConfigService,
    private readonly db: DataSource, private readonly config: ConfigService, private readonly events: EventEmitter2) {}

  @Put('providers/:provider') @Permissions('voice:manage')
  async saveProvider(@TenantId() tenantId: string, @Param('provider') provider: string, @Body() dto: ProviderDto, @CurrentUser() actor: IRequestContext) {
    if (Object.values(dto.credentials).some((v) => typeof v !== 'string') || !/^\+[1-9]\d{7,14}$/.test(dto.settings.defaultCallerId ?? '')) throw new BadRequestException('Credentials and an E.164 default caller ID are required');
    if (dto.settings.concurrency !== undefined && (!Number.isInteger(dto.settings.concurrency) || dto.settings.concurrency < 1 || dto.settings.concurrency > 100)) throw new BadRequestException('Provider concurrency must be 1–100');
    const result = await this.configs.save(tenantId, provider, dto.credentials, { defaultCallerId: dto.settings.defaultCallerId, concurrency: dto.settings.concurrency ?? 10 });
    this.events.emit(EVENT_NAMES.AUDIT_LOG, { tenantId, userId: actor.userId, action: 'voice.provider.updated', resource: 'voice_provider', resourceId: provider, changes: { provider } });
    return result;
  }
  @Post('providers/:provider/validate') @Permissions('voice:manage')
  async validateProvider(@TenantId() tenantId: string, @Param('provider') provider: string) { return (await this.providers.getProvider(tenantId, provider)).checkHealth(tenantId); }
  @Get('providers/:provider/numbers')
  async numbers(@TenantId() tenantId: string, @Param('provider') provider: string) { return (await this.providers.getProvider(tenantId, provider)).listPhoneNumbers(tenantId); }
  @Get('audience')
  audiencePage(@TenantId() tenantId: string, @Query('type') type: string, @Query('search') search: string, @Query('status') status: string, @Query('after') after: string) { return this.audience.page(tenantId, { type, search, status }, after); }
  @Post('import') @Permissions('contacts:create', 'voice:create')
  import(@TenantId() tenantId: string, @Body() dto: ImportDto) { return this.audience.importCsv(tenantId, dto.csv, dto.mapping, dto.commit); }
  @Post('campaigns/:id/prepare') @Permissions('voice:update')
  prepare(@TenantId() tenantId: string, @Param('id') id: string) { return this.runtime.prepare(tenantId, id); }
  @Get('campaigns/:id/review')
  review(@TenantId() tenantId: string, @Param('id') id: string) { return this.runtime.review(tenantId, id); }

  @Public() @Post('webhook/:callId')
  async webhook(@Param('callId') callId: string, @Req() req: Request, @Query('kind') kind?: string) {
    const call = await this.db.getRepository(VoiceCall).findOneBy({ id: callId });
    if (!call) throw new ForbiddenException('Unknown call reference');
    const provider = await this.providers.getProvider(call.tenantId, call.provider);
    const url = `${String(this.config.get('APP_URL')).replace(/\/$/, '')}${req.originalUrl}`;
    const params = Object.fromEntries(Object.entries(req.body ?? {}).map(([key, value]) => [key, String(value)]));
    const signature = req.get(call.provider === 'signalwire' ? 'x-signalwire-signature' : 'x-twilio-signature');
    if (!await provider.verifyWebhook(call.tenantId, signature, url, params)) throw new ForbiddenException('Invalid provider signature');
    if (!call.sid.startsWith('pending-') && params.CallSid !== call.sid) throw new ForbiddenException('Provider call ID mismatch');
    await this.runtime.ingest(call, { ...params, kind });
    return { accepted: true };
  }
}
