import { createHash } from 'crypto';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { In, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { QUEUE_NAMES } from '../../queue/queue.constants';
import { WhatsAppAccount } from '../../database/entities/whatsapp-account.entity';
import {
  WhatsAppWebhookEvent,
  WhatsappWebhookEventStatus,
} from '../../database/entities/whatsapp-webhook-event.entity';
import {
  WHATSAPP_OUTBOUND_ACCEPTED,
  WhatsappOutboundAcceptedEvent,
  WhatsappSlaCheckPayload,
  WhatsappService,
} from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappAccountService } from './whatsapp-account.service';

export interface WhatsappWebhookJob {
  eventId: string;
}
/** Pre-inbox job shape that may still sit in Redis during rollout. */
interface LegacyWhatsappWebhookJob {
  tenantId: string;
  payload: Record<string, unknown>;
}

export interface MetaWebhookBody {
  object?: unknown;
  entry: Array<{
    id?: unknown;
    changes?: Array<{ field?: unknown; value?: Record<string, unknown> }>;
  }>;
}

interface HandleResult {
  status: Extract<WhatsappWebhookEventStatus, 'PROCESSED' | 'IGNORED'>;
  note?: string;
}

/** Status events that beat their wamid write stay FAILED (retryable) for this long. */
const STATUS_BUFFER_MS = 24 * 60 * 60 * 1000;
const MAX_SWEEP_ATTEMPTS = 20;
const ENQUEUE_TIMEOUT_MS = 3000;

/**
 * whatsapp_webhook_events is the source of truth; Bull jobs only carry the event ID,
 * so cleaning or losing a job never loses a webhook (the sweeper re-drives the row).
 */
@Processor(QUEUE_NAMES.WHATSAPP)
export class WhatsappWebhookProcessor {
  private readonly logger = new Logger(WhatsappWebhookProcessor.name);
  private sweeping = false;

  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly templates: WhatsappTemplateService,
    private readonly accounts: WhatsappAccountService,
    @InjectRepository(WhatsAppWebhookEvent)
    private readonly events: Repository<WhatsAppWebhookEvent>,
    @InjectQueue(QUEUE_NAMES.WHATSAPP)
    private readonly queue: Queue<WhatsappWebhookJob | WhatsappSlaCheckPayload>,
  ) {}

  /** Persists every change of a signature-verified delivery, then enqueues it. */
  async ingest(body: MetaWebhookBody): Promise<void> {
    const object = typeof body.object === 'string' ? body.object.slice(0, 64) : 'unknown';
    for (const entry of body.entry) {
      const businessAccountId =
        typeof entry.id === 'string' && /^\d{1,64}$/.test(entry.id) ? entry.id : null;
      for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
        const field = typeof change.field === 'string' ? change.field.slice(0, 64) : 'unknown';
        const metadata = change.value?.metadata as { phone_number_id?: unknown } | undefined;
        const phoneNumberId =
          typeof metadata?.phone_number_id === 'string'
            ? metadata.phone_number_id.slice(0, 64)
            : null;
        const tenantId = phoneNumberId
          ? await this.accounts.findTenantByPhoneNumberId(phoneNumberId)
          : null;
        // Unknown/disconnected phones fail closed but are kept for audit.
        const ignored = Boolean(phoneNumberId) && !tenantId;
        const payload = { object, entry: [{ id: entry.id, changes: [change] }] };
        const dedupeKey = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
        await this.events
          .createQueryBuilder()
          .insert()
          .values({
            tenantId,
            phoneNumberId,
            businessAccountId,
            object,
            field,
            dedupeKey,
            payload,
            status: ignored ? 'IGNORED' : 'RECEIVED',
            lastError: ignored ? 'No connected WhatsApp account for this phone number' : null,
          })
          .orIgnore()
          .execute();
        const event = await this.events.findOne({
          where: { dedupeKey },
          select: { id: true, status: true, attempts: true },
        });
        if (event?.status !== 'RECEIVED') continue;
        try {
          await this.enqueue(event.id, event.attempts);
        } catch (error: unknown) {
          // The row is durable; the sweeper enqueues it once Redis is reachable.
          this.logger.warn(`Deferred WhatsApp webhook ${event.id}: ${this.message(error)}`);
        }
      }
    }
  }

  @Process({ name: 'webhook-event', concurrency: 4 })
  async process(job: Job<WhatsappWebhookJob | LegacyWhatsappWebhookJob>): Promise<void> {
    if ('eventId' in job.data) return this.processEvent(job.data.eventId);
    await this.whatsapp.processIncomingMessage(job.data.tenantId, job.data.payload);
  }

  @Process({ name: 'conversation-sla-check', concurrency: 4 })
  async processConversationSla(job: Job<WhatsappSlaCheckPayload>): Promise<void> {
    await this.whatsapp.escalateConversationSla(job.data);
  }

  async processEvent(id: string): Promise<void> {
    let failure: unknown;
    await this.events.manager.transaction(async (manager) => {
      const repo = manager.getRepository(WhatsAppWebhookEvent);
      // ponytail: the row lock holds one pooled connection per in-flight event (concurrency 4);
      // switch to a PROCESSING lease column if the pool becomes the bottleneck.
      const event = await repo.findOne({
        where: { id, status: In(['RECEIVED', 'FAILED']) },
        lock: { mode: 'pessimistic_write', onLocked: 'skip_locked' },
      });
      if (!event) return; // Already handled, or another worker holds it.
      event.attempts += 1;
      try {
        const result = await this.handle(event);
        event.status = result.status;
        event.lastError = result.note ?? null;
        event.processedAt = new Date();
      } catch (error: unknown) {
        failure = error;
        event.status = 'FAILED';
        event.lastError = this.message(error).slice(0, 2000);
      }
      await repo.save(event);
    });
    if (failure) throw failure;
  }

  private async handle(event: WhatsAppWebhookEvent): Promise<HandleResult> {
    const entry = (event.payload.entry as MetaWebhookBody['entry'] | undefined)?.[0];
    const value = entry?.changes?.[0]?.value ?? {};
    switch (event.field) {
      case 'messages': {
        if (!event.tenantId) return { status: 'IGNORED', note: 'No tenant for this phone number' };
        const { unmatchedStatuses } = await this.whatsapp.processIncomingMessage(
          event.tenantId,
          event.payload,
        );
        await this.scheduleConversationSlaChecks(event.tenantId, event.payload);
        if (!unmatchedStatuses.length) return { status: 'PROCESSED' };
        const note = `No outbound message yet for status ${unmatchedStatuses.join(', ')}`;
        // Throwing keeps the event FAILED-retryable until the wamid is written (see below).
        if (Date.now() - event.receivedAt.getTime() < STATUS_BUFFER_MS) throw new Error(note);
        return { status: 'PROCESSED', note };
      }
      case 'message_template_status_update': {
        const businessAccountId = event.businessAccountId ?? '';
        const tenantId = await this.accounts.findTenantByBusinessAccountId(businessAccountId);
        if (!tenantId)
          return {
            status: 'IGNORED',
            note: 'No unique connected tenant owns this WhatsApp business account',
          };
        const updated = await this.templates.applyStatusWebhook(tenantId, businessAccountId, value);
        return updated
          ? { status: 'PROCESSED' }
          : { status: 'IGNORED', note: 'No bound template for this business account' };
      }
      case 'phone_number_quality_update':
        if (typeof value.current_limit === 'string')
          await this.updateAccount(event.businessAccountId, value.display_phone_number, {
            messagingLimitTier: value.current_limit.slice(0, 40),
          });
        return { status: 'PROCESSED' };
      case 'phone_number_name_update':
        if (typeof value.decision === 'string')
          await this.updateAccount(event.businessAccountId, value.display_phone_number, {
            nameStatus: value.decision.slice(0, 40),
          });
        return { status: 'PROCESSED' };
      case 'account_update':
        // No account column for these yet; the payload is retained on the event row.
        return { status: 'PROCESSED' };
      default:
        return { status: 'IGNORED', note: `Unhandled webhook field: ${event.field}` };
    }
  }

  private async updateAccount(
    businessAccountId: string | null,
    displayPhoneNumber: unknown,
    patch: Partial<Pick<WhatsAppAccount, 'messagingLimitTier' | 'nameStatus'>>,
  ): Promise<void> {
    const digits = String(displayPhoneNumber ?? '').replace(/\D/g, '');
    if (!businessAccountId || !digits) return;
    await this.events.manager
      .createQueryBuilder()
      .update(WhatsAppAccount)
      .set(patch)
      .where(
        "business_account_id = :businessAccountId AND regexp_replace(display_phone_number, '[^0-9]', '', 'g') = :digits",
        { businessAccountId, digits },
      )
      .execute();
  }

  private async scheduleConversationSlaChecks(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const changes = Array.isArray((entry as { changes?: unknown }).changes)
        ? (entry as { changes: Array<{ value?: Record<string, unknown> }> }).changes
        : [];
      for (const change of changes) {
        const value = change.value;
        const metadata = value?.metadata as { phone_number_id?: unknown } | undefined;
        const phoneNumberId =
          typeof metadata?.phone_number_id === 'string' ? metadata.phone_number_id : '';
        const messages = Array.isArray(value?.messages) ? value.messages : [];
        for (const item of messages) {
          if (!item || typeof item !== 'object') continue;
          const message = item as {
            id?: unknown;
            from?: unknown;
            timestamp?: unknown;
            type?: unknown;
            text?: { body?: unknown };
            interactive?: {
              button_reply?: { title?: unknown };
              list_reply?: { title?: unknown };
            };
          };
          const messageSid = typeof message.id === 'string' ? message.id : '';
          const phone = typeof message.from === 'string' ? message.from : '';
          const timestamp = Number(message.timestamp) * 1000;
          if (
            !phoneNumberId ||
            !messageSid ||
            !/^\d{8,15}$/.test(phone.replace(/\D/g, '')) ||
            !Number.isFinite(timestamp) ||
            timestamp > Date.now() + 300000
          )
            continue;
          const text =
            typeof message.text?.body === 'string'
              ? message.text.body
              : String(
                  message.interactive?.button_reply?.title ??
                    message.interactive?.list_reply?.title ??
                    '',
                );
          if (this.whatsapp.consentKeyword(text)) continue;
          const delay = Math.max(timestamp + this.whatsapp.getSlaThresholdMs() - Date.now(), 0);
          const fingerprint = createHash('sha256')
            .update(`${phoneNumberId}:${messageSid}`)
            .digest('hex');
          await this.queue.add(
            'conversation-sla-check',
            { tenantId, phoneNumberId, phone, messageSid },
            {
              jobId: `whatsapp-sla-${tenantId}-${fingerprint}`,
              delay,
              attempts: 5,
              backoff: { type: 'exponential', delay: 5000 },
              removeOnComplete: { age: 1209600, count: 20000 },
              removeOnFail: { age: 2592000, count: 10000 },
            },
          );
        }
      }
    }
  }

  /** Bounded so a Redis outage cannot hold Meta's request open; the row is already durable. */
  async enqueue(eventId: string, attempts: number): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.queue.add(
          'webhook-event',
          { eventId },
          {
            // Per-attempt ID: replicas sweeping the same row collapse into one job.
            jobId: `webhook-event-${eventId}-${attempts}`,
            attempts: 8,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 10000,
            removeOnFail: 10000,
          },
        ),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Queue unavailable')), ENQUEUE_TIMEOUT_MS);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  /** Apply status events that arrived before their outbound row had a wamid. */
  @OnEvent(WHATSAPP_OUTBOUND_ACCEPTED)
  async applyBufferedStatuses({ tenantId, messageSid }: WhatsappOutboundAcceptedEvent) {
    try {
      const probe = { entry: [{ changes: [{ value: { statuses: [{ id: messageSid }] } }] }] };
      const rows = await this.events
        .createQueryBuilder('e')
        .select(['e.id', 'e.attempts'])
        .where("e.tenantId = :tenantId AND e.status = 'FAILED' AND e.field = 'messages'", {
          tenantId,
        })
        .andWhere('e.payload @> CAST(:probe AS jsonb)', { probe: JSON.stringify(probe) })
        .take(50)
        .getMany();
      for (const row of rows) await this.enqueue(row.id, row.attempts);
    } catch (error: unknown) {
      // Bull retries and the sweeper still pick these up.
      this.logger.warn(`Buffered status replay deferred: ${this.message(error)}`);
    }
  }

  /** Re-enqueue FAILED events (optionally one tenant / specific IDs). Platform-admin only. */
  async replayFailed(filter: { tenantId?: string; ids?: string[] }): Promise<{ enqueued: number }> {
    const rows = await this.events.find({
      where: {
        status: 'FAILED',
        ...(filter.tenantId ? { tenantId: filter.tenantId } : {}),
        ...(filter.ids?.length ? { id: In(filter.ids) } : {}),
      },
      select: { id: true, attempts: true },
      order: { receivedAt: 'ASC' },
      take: 500,
    });
    for (const row of rows) await this.enqueue(row.id, row.attempts);
    return { enqueued: rows.length };
  }

  /** Tenant-safe operational view; raw webhook payloads are intentionally never returned. */
  async listTenantEvents(tenantId: string) {
    const rows = await this.events.find({
      where: { tenantId },
      select: {
        id: true,
        phoneNumberId: true,
        field: true,
        status: true,
        attempts: true,
        lastError: true,
        receivedAt: true,
        processedAt: true,
      },
      order: { receivedAt: 'DESC' },
      take: 100,
    });
    return rows.map((event) => ({
      ...event,
      lastError:
        event.lastError
          ?.replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
          .replace(/\bEAA[A-Za-z0-9]{20,}\b/g, '[redacted]')
          .replace(
            /\b(access[_-]?token|authorization|appsecret_proof|password)\s*[:=]\s*[^&\s,;]+/gi,
            '$1=[redacted]',
          ) ?? null,
    }));
  }

  async replayTenantEvent(tenantId: string, id: string): Promise<{ enqueued: boolean }> {
    const event = await this.events.findOne({
      where: { tenantId, id, status: 'FAILED' },
      select: { id: true, attempts: true },
    });
    if (!event) {
      const owned = await this.events.exist({ where: { tenantId, id } });
      if (!owned) throw new NotFoundException('Webhook event not found');
      throw new BadRequestException('Only failed webhook events can be replayed');
    }
    await this.enqueue(event.id, event.attempts);
    return { enqueued: true };
  }

  /**
   * Replica-safe: the outbound expiry is one conditional UPDATE, enqueue uses per-attempt job
   * IDs, and processEvent claims rows with SKIP LOCKED.
   */
  @Interval(60000)
  async sweep(): Promise<void> {
    if (this.sweeping) return;
    this.sweeping = true;
    try {
      const expired = await this.whatsapp.expireUnconfirmedOutbound();
      if (expired) this.logger.warn(`Expired ${expired} unconfirmed WhatsApp outbound message(s)`);
      const now = Date.now();
      const rows = await this.events
        .createQueryBuilder('e')
        .select(['e.id', 'e.attempts'])
        .where(
          "(e.status = 'RECEIVED' AND e.receivedAt < :stale) OR (e.status = 'FAILED' AND e.updatedAt < :retry AND e.attempts < :max AND e.receivedAt > :horizon)",
          {
            stale: new Date(now - 60000),
            retry: new Date(now - 30000),
            max: MAX_SWEEP_ATTEMPTS,
            horizon: new Date(now - STATUS_BUFFER_MS),
          },
        )
        .orderBy('e.receivedAt', 'ASC')
        .take(200)
        .getMany();
      for (const row of rows) await this.enqueue(row.id, row.attempts);
    } catch (error: unknown) {
      this.logger.warn(`WhatsApp sweep deferred: ${this.message(error)}`);
    } finally {
      this.sweeping = false;
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'unavailable';
  }
}
