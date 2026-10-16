import { createHmac, timingSafeEqual, createHash } from 'crypto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  Headers,
  ForbiddenException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { WhatsappService } from './whatsapp.service';
import { WhatsappWebhookProcessor } from './whatsapp-webhook.processor';
import type { MetaWebhookBody } from './whatsapp-webhook.processor';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { PlanFeature, ResourcePermissions, Roles, TenantId } from '../../common/decorators';
import { env } from '../../config/env.config';

/** Constant-time comparison for secrets of arbitrary length. */
export function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

@SkipThrottle()
@Controller('whatsapp/webhook')
export class MetaWebhookController {
  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly config: ConfigService,
    private readonly inbox: WhatsappWebhookProcessor,
  ) {}
  @Get()
  @Public()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const configured = this.whatsapp.getVerifyToken();
    if (configured && mode === 'subscribe' && safeEqual(String(token ?? ''), configured))
      return challenge;
    throw new ForbiddenException('Invalid verify token');
  }
  @Post()
  @Public()
  async receiveMessage(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    const secret = this.config.get<string>('META_APP_SECRET') || env.whatsapp.appSecret;
    if (!secret || secret === 'mock_secret' || !req.rawBody)
      throw new ForbiddenException('Webhook verification is not configured');
    if (!signature || !/^sha256=[a-f0-9]{64}$/.test(signature))
      throw new ForbiddenException('Missing or invalid webhook signature');
    const actual = Buffer.from(signature.slice(7), 'hex');
    const expected = createHmac('sha256', secret).update(req.rawBody).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new ForbiddenException('Signature mismatch');
    const body = req.body as Partial<MetaWebhookBody>;
    if (!Array.isArray(body.entry)) throw new BadRequestException('Invalid webhook payload');
    // Durable insert before acknowledgment; a DB failure returns 5xx so Meta redelivers.
    await this.inbox.ingest({ object: body.object, entry: body.entry });
    res.status(200).send('OK');
  }
}

export class ReplayWhatsappWebhookEventsDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  ids?: string[];
}

@ApiTags('Admin / WhatsApp webhooks')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/whatsapp/webhook-events')
export class WhatsappWebhookAdminController {
  constructor(private readonly inbox: WhatsappWebhookProcessor) {}

  @Post('replay')
  @ApiOperation({ summary: 'Re-enqueue FAILED WhatsApp webhook events (optionally per tenant)' })
  replay(@Body() dto: ReplayWhatsappWebhookEventsDto) {
    return this.inbox.replayFailed(dto);
  }
}

@ApiTags('WhatsApp webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp/webhook-events')
export class WhatsappWebhookTenantController {
  constructor(private readonly inbox: WhatsappWebhookProcessor) {}

  @Get()
  @ApiOperation({ summary: 'List recent WhatsApp webhook delivery events for this tenant' })
  list(@TenantId() tenantId: string) {
    return this.inbox.listTenantEvents(tenantId);
  }

  @Post(':id/replay')
  @ApiOperation({ summary: 'Replay one failed WhatsApp webhook event belonging to this tenant' })
  replay(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.inbox.replayTenantEvent(tenantId, id);
  }
}

export class ReconcileWhatsappMessageDto {
  @IsIn(['SENT', 'FAILED'])
  outcome!: 'SENT' | 'FAILED';

  /** The wamid, when the operator can confirm it from Meta. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  providerMessageId?: string;
}

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp/messages')
export class WhatsappReconciliationController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Resolve an UNKNOWN/EXPIRED outbound message as sent or failed' })
  reconcile(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReconcileWhatsappMessageDto,
  ) {
    return this.whatsapp.reconcileMessage(tenantId, id, dto.outcome, dto.providerMessageId);
  }
}
