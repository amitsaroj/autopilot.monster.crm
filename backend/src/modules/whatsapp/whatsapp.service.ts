import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { ArrayContains, EntityManager, In, Repository } from 'typeorm';

import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WhatsAppBroadcast } from '../../database/entities/whatsapp-broadcast.entity';
import { Flow } from '../../database/entities/flow.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';
import { Contact } from '../../database/entities/contact.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { Tenant } from '../../database/entities/tenant.entity';
import { env } from '../../config/env.config';
import { WhatsappAccountService } from './whatsapp-account.service';
import type { WhatsappAccountCredentials } from './whatsapp-account.service';
import {
  WhatsappProviderRegistry,
  WhatsappProviderError,
  type WhatsappMediaDownload,
} from './whatsapp-provider';
import { WhatsappConsentService } from './whatsapp-consent.service';
import {
  WhatsAppTemplate,
  WhatsAppTemplateStatus,
} from '../../database/entities/whatsapp-template.entity';
import { UserEntity, UserStatus } from '../auth/entities/user.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { PricingService } from '../pricing/pricing.service';
import { resolveUsagePeriodBounds } from '../billing/usage-period.util';
import { Note } from '../../database/entities/note.entity';
import { Notification } from '../../database/entities/notification.entity';
import { TeamGroup } from '../../database/entities/team-group.entity';
import { UpdateWhatsappConversationDto } from './dto/whatsapp-conversation.dto';

export type WhatsappConversationStatus = 'OPEN' | 'RESOLVED';
type WhatsappCsatStatus = 'SENDING' | 'REQUESTED' | 'RECEIVED' | 'CANCELLED' | 'EXPIRED';

export interface WhatsappConversationSummary {
  phone: string;
  contactName?: string;
  lastMessage: string;
  lastMessageAt: Date;
  direction: 'INBOUND' | 'OUTBOUND';
  messageCount: number;
  unreadCount: number;
  assigneeId?: string;
  teamId?: string;
  status: WhatsappConversationStatus;
  lastInboundAt?: Date;
  windowExpiresAt?: Date;
  canReply: boolean;
  replyBlockedReason?: string;
  phoneNumberId?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  awaitingReplyCount?: number;
  csatStatus?: WhatsappCsatStatus;
  csatRating?: number;
}

export interface WhatsappFlowNodeDefinition {
  type: string;
  label: string;
  configSchema: Record<string, string>;
}

const DEFAULT_SLA_MS = 15 * 60 * 1000;
const DEFAULT_UNCONFIRMED_TTL_MS = 30 * 60 * 1000;
const INBOX_PRESENCE_TTL_MS = 60_000;

/** Internal: an outbound row just received its provider message ID (wamid). */
export const WHATSAPP_OUTBOUND_ACCEPTED = 'whatsapp.outbound.accepted';
export interface WhatsappOutboundAcceptedEvent {
  tenantId: string;
  messageSid: string;
}

export interface WhatsappSlaCheckPayload {
  tenantId: string;
  phoneNumberId: string;
  phone: string;
  messageSid: string;
}

export type WhatsappConsentKeyword = 'OPT_OUT' | 'OPT_IN';

/** Keep only stable click identifiers; ad copy and media URLs are unnecessary for lead attribution. */
export function extractMetaWhatsappReferral(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const referral = value as Record<string, unknown>;
  const attribution: Record<string, string> = {};
  if (typeof referral.ctwa_clid === 'string' && /^[A-Za-z0-9_-]{1,1024}$/.test(referral.ctwa_clid))
    attribution.ctwaClid = referral.ctwa_clid;
  if (typeof referral.source_id === 'string' && /^\d{1,64}$/.test(referral.source_id))
    attribution.sourceId = referral.source_id;
  if (referral.source_type === 'ad' || referral.source_type === 'post')
    attribution.sourceType = referral.source_type;
  if (
    attribution.sourceId &&
    typeof referral.source_url === 'string' &&
    referral.source_url.startsWith('https://') &&
    referral.source_url.length <= 2048
  )
    attribution.sourceUrl = referral.source_url;
  return attribution.ctwaClid || attribution.sourceId ? attribution : undefined;
}

/** Upper-case, strip punctuation/emoji and collapse whitespace: " Stop! " -> "STOP". */
const normalizeKeyword = (text: string): string =>
  text
    .normalize('NFKC')
    .toLocaleUpperCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly verifyToken: string;

  constructor(
    private configService: ConfigService,
    private readonly messageRepository: WhatsappMessageRepository,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly eventEmitter: EventEmitter2,
    private readonly accounts: WhatsappAccountService,
    private readonly providers: WhatsappProviderRegistry,
    private readonly consent: WhatsappConsentService,
    private readonly pricing: PricingService,
    @InjectRepository(WhatsAppMessage) private readonly messages: Repository<WhatsAppMessage>,
    @InjectRepository(WhatsAppTemplate) private readonly templates: Repository<WhatsAppTemplate>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.verifyToken =
      this.configService.get('META_WEBHOOK_VERIFY_TOKEN') || env.whatsapp.verifyToken || '';
  }

  getVerifyToken(): string {
    return this.verifyToken;
  }

  async recordInboxPresence(tenantId: string, userId: string) {
    const user = await this.users.findOne({
      where: { id: userId, tenantId, status: UserStatus.ACTIVE },
      select: { id: true },
    });
    if (!user) throw new ForbiddenException('Only active workspace members can publish presence');
    await this.cacheManager.set(
      `whatsapp:inbox-presence:${tenantId}:${userId}`,
      Date.now(),
      INBOX_PRESENCE_TTL_MS,
    );
    return { online: true, expiresInSeconds: INBOX_PRESENCE_TTL_MS / 1000 };
  }

  async getOnlineInboxAgentIds(tenantId: string): Promise<string[]> {
    const users = await this.users.find({
      where: { tenantId, status: UserStatus.ACTIVE },
      select: { id: true },
    });
    const now = Date.now();
    const presences = await Promise.all(
      users.map(async ({ id }) => ({
        id,
        lastSeenAt: await this.cacheManager.get<number>(
          `whatsapp:inbox-presence:${tenantId}:${id}`,
        ),
      })),
    );
    return presences
      .filter(
        ({ lastSeenAt }) =>
          typeof lastSeenAt === 'number' &&
          lastSeenAt <= now &&
          now - lastSeenAt < INBOX_PRESENCE_TTL_MS,
      )
      .map(({ id }) => id);
  }

  /**
   * Called only after signature verification and account-derived tenant routing.
   * Returns status IDs that matched no outbound row yet (status raced ahead of the wamid write).
   */
  async processIncomingMessage(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<{ unmatchedStatuses: string[] }> {
    const unmatchedStatuses: string[] = [];
    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value as Record<string, unknown> | undefined;
        if (!value) continue;
        const phoneNumberId = String(
          (value.metadata as { phone_number_id?: string } | undefined)?.phone_number_id ?? '',
        );
        if (
          !phoneNumberId ||
          (await this.accounts.findTenantByPhoneNumberId(phoneNumberId)) !== tenantId
        ) {
          throw new ForbiddenException('Webhook account does not belong to this tenant');
        }
        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        unmatchedStatuses.push(
          ...(await this.processDeliveryStatuses(tenantId, phoneNumberId, statuses)),
        );
        const inbound = Array.isArray(value.messages) ? value.messages : [];
        for (const message of inbound) {
          if (!message || typeof message !== 'object' || !message.id || !message.from) continue;
          const senderPhone = this.consent.normalizePhone(String(message.from));
          const messageType = String(message.type ?? 'text');
          const interactive = message.interactive as
            | {
                button_reply?: { id?: string; title?: string };
                list_reply?: { id?: string; title?: string };
              }
            | undefined;
          const selection = interactive?.button_reply ?? interactive?.list_reply;
          const messageText =
            (message.text as { body?: string } | undefined)?.body ??
            selection?.title ??
            (message.button as { text?: string } | undefined)?.text ??
            this.describeMediaMessage(messageType, message);
          const messageSid = String(message.id);
          const attribution = extractMetaWhatsappReferral(message.referral);
          const providerTime = new Date(Number(message.timestamp) * 1000);
          if (
            !Number.isFinite(providerTime.getTime()) ||
            providerTime.getTime() > Date.now() + 300000
          ) {
            // Skip only this message; the raw change stays in whatsapp_webhook_events.
            this.logger.warn(`Skipping WhatsApp message ${messageSid}: invalid provider timestamp`);
            continue;
          }
          const keyword = this.consentKeyword(messageText);
          await this.messages
            .createQueryBuilder()
            .insert()
            .values({
              tenantId,
              messageSid,
              from: senderPhone,
              to: String(
                (value.metadata as { display_phone_number?: string })?.display_phone_number ??
                  phoneNumberId,
              ),
              phoneNumberId,
              providerTimestamp: providerTime,
              body: messageText,
              direction: 'INBOUND',
              status: 'DELIVERED',
              mediaUrls: this.extractMediaUrls(messageType, message),
            })
            .orIgnore()
            .returning('id')
            .execute();
          const stored = await this.messages.findOne({
            where: { tenantId, messageSid, direction: 'INBOUND' },
          });
          if (!stored || stored.workflowDispatched) continue;
          if (keyword) {
            await this.applyConsentKeyword(tenantId, senderPhone, keyword, messageSid);
            continue;
          }
          const contact = await this.findOrCreateContactByPhone(tenantId, senderPhone);
          if (await this.captureCsatReply(contact, senderPhone, messageText, messageSid)) {
            await this.messages.update({ tenantId, id: stored.id }, { workflowDispatched: true });
            continue;
          }
          const reopened = await this.messages.manager.transaction(async (manager) => {
            const row = await manager.getRepository(Contact).findOne({
              where: { tenantId, id: contact.id },
              lock: { mode: 'pessimistic_write' },
            });
            if (!row) return false;
            if (row.customFields?.whatsappStatus !== 'RESOLVED') return false;
            row.customFields = { ...row.customFields, whatsappStatus: 'OPEN' };
            await manager.save(row);
            return true;
          });
          if (reopened)
            await this.emitConversationTransition(
              EVENT_NAMES.WHATSAPP_CONVERSATION_REOPENED,
              tenantId,
              senderPhone,
              contact.id,
              phoneNumberId,
              `whatsapp-conversation-reopened:${messageSid}`,
            );
          await this.eventEmitter.emitAsync(EVENT_NAMES.MESSAGE_RECEIVED, {
            tenantId,
            channel: 'whatsapp',
            phone: senderPhone,
            body: messageText,
            messageSid,
            eventId: messageSid,
            contactId: contact.id,
            phoneNumberId,
            messageType,
            selectionId: selection?.id,
            ...(attribution ? { attribution } : {}),
          });
          await this.messages.update({ tenantId, id: stored.id }, { workflowDispatched: true });
        }
      }
    }
    return { unmatchedStatuses };
  }

  isOptOut(text: string): boolean {
    return this.consentKeyword(text) === 'OPT_OUT';
  }

  /** Tolerates case, surrounding whitespace and punctuation ("stop!", " Unsubscribe. "). */
  consentKeyword(text: string): WhatsappConsentKeyword | null {
    const normalized = normalizeKeyword(text);
    if (!normalized) return null;
    const matches = (setting: string, fallback: string) =>
      (this.configService.get<string>(setting) ?? fallback)
        .split(',')
        .some((keyword) => normalizeKeyword(keyword) === normalized);
    if (
      matches(
        'WHATSAPP_OPT_OUT_KEYWORDS',
        'STOP,UNSUBSCRIBE,CANCEL,END,QUIT,STOP ALL,OPT OUT,OPTOUT',
      )
    )
      return 'OPT_OUT';
    if (matches('WHATSAPP_OPT_IN_KEYWORDS', 'START,SUBSCRIBE,UNSTOP,RESUME')) return 'OPT_IN';
    return null;
  }

  private async applyConsentKeyword(
    tenantId: string,
    phone: string,
    keyword: WhatsappConsentKeyword,
    messageSid: string,
  ): Promise<void> {
    await this.consent.applyInboundKeyword(
      tenantId,
      phone,
      keyword === 'OPT_OUT' ? 'OPTED_OUT' : 'OPTED_IN',
      messageSid,
    );
  }

  private readPricing(
    value: unknown,
  ): Pick<WhatsAppMessage, 'pricingBillable' | 'pricingCategory' | 'pricingModel'> | null {
    if (!value || typeof value !== 'object') return null;
    const pricing = value as Record<string, unknown>;
    const text = (input: unknown) =>
      typeof input === 'string' && input.length <= 64 ? input : undefined;
    const result = Object.fromEntries(
      Object.entries({
        pricingBillable: typeof pricing.billable === 'boolean' ? pricing.billable : undefined,
        pricingCategory: text(pricing.category),
        pricingModel: text(pricing.pricing_model),
      }).filter(([, entry]) => entry !== undefined),
    ) as Pick<WhatsAppMessage, 'pricingBillable' | 'pricingCategory' | 'pricingModel'>;
    return Object.keys(result).length ? result : null;
  }

  /** Returns status IDs whose outbound row does not exist (yet). */
  private async processDeliveryStatuses(
    tenantId: string,
    phoneNumberId: string,
    statuses: Array<Record<string, unknown>>,
  ): Promise<string[]> {
    const rank: Record<string, number> = { SUBMITTED: 0, SENT: 1, DELIVERED: 2, READ: 3 };
    const unmatched: string[] = [];
    for (const entry of statuses) {
      const messageSid = String(entry.id ?? '');
      const status = String(entry.status ?? '').toUpperCase();
      if (!messageSid || !['SENT', 'DELIVERED', 'READ', 'FAILED'].includes(status)) continue;
      const pricing = this.readPricing(entry.pricing);
      const outcome = await this.messages.manager.transaction(async (manager) => {
        const row = await manager.getRepository(WhatsAppMessage).findOne({
          where: { tenantId, phoneNumberId, messageSid, direction: 'OUTBOUND' },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row) return 'MISSING' as const;
        // Replays retry event dispatch after a queue failure; workflow event IDs suppress duplicate executions.
        const replay = row.status === status;
        const stale =
          !replay &&
          ((status !== 'FAILED' && (rank[row.status] ?? -1) >= rank[status]) ||
            (status === 'FAILED' && ['DELIVERED', 'READ'].includes(row.status)));
        if (!replay && !stale) {
          row.status = status;
          if (status === 'FAILED') {
            const errors = entry.errors as Array<{ code?: number; title?: string }> | undefined;
            row.errorReason =
              errors
                ?.map(
                  (error) => `${error.code ?? ''} ${error.title ?? 'Provider rejected message'}`,
                )
                .join('; ') ?? 'Provider delivery failed';
          }
        }
        // Pricing is captured even from out-of-order (stale) statuses.
        if (pricing) Object.assign(row, pricing);
        if ((!replay && !stale) || pricing) await manager.save(row);
        return stale ? null : row;
      });
      if (outcome === 'MISSING') {
        unmatched.push(messageSid);
        continue;
      }
      const changed = outcome;
      if (changed && ['DELIVERED', 'READ', 'FAILED'].includes(status)) {
        await this.eventEmitter.emitAsync(
          status === 'READ'
            ? EVENT_NAMES.MESSAGE_READ
            : status === 'DELIVERED'
              ? EVENT_NAMES.MESSAGE_DELIVERED
              : EVENT_NAMES.MESSAGE_FAILED,
          {
            tenantId,
            channel: 'whatsapp',
            phone: changed.to,
            phoneNumberId,
            messageSid,
            eventId: `${messageSid}:${status}`,
          },
        );
      }
    }
    return unmatched;
  }

  async sendTextMessage(
    tenantId: string,
    to: string,
    text: string,
    wabaId?: string,
    idempotencyKey?: string,
    expectedLastOutboundId?: string | null,
  ): Promise<WhatsAppMessage> {
    if (!text.trim() || text.length > 4096 || /\{\{[^}]+\}\}/.test(text))
      throw new BadRequestException('Provide a resolved message between 1 and 4096 characters');
    const { phone, credentials } = await this.serviceMessageRecipient(tenantId, to, wabaId);
    return this.submitMessage(
      tenantId,
      phone,
      text,
      credentials,
      { type: 'text', text: { body: text } },
      idempotencyKey,
      undefined,
      'SERVICE',
      expectedLastOutboundId,
    );
  }

  private async serviceMessageRecipient(tenantId: string, to: string, wabaId?: string) {
    const phone = this.consent.normalizePhone(to);
    const credentials = await this.accounts.getCredentials(tenantId, wabaId);
    const eligibility = await this.consent.getEligibility(tenantId, phone, 'SERVICE');
    if (!eligibility.eligible)
      throw new ForbiddenException(eligibility.reason ?? 'Recipient is suppressed');
    const inbound = await this.messages.findOne({
      where: {
        tenantId,
        from: phone,
        phoneNumberId: credentials.phoneNumberId,
        direction: 'INBOUND',
      },
      order: { providerTimestamp: 'DESC' },
    });
    if (
      !inbound ||
      !inbound.providerTimestamp ||
      inbound.providerTimestamp.getTime() + 86400000 <= Date.now()
    ) {
      throw new BadRequestException(
        'The customer-service window is closed. Use an approved template.',
      );
    }
    return { phone, credentials };
  }

  async sendContentMessage(
    tenantId: string,
    to: string,
    content: Record<string, unknown>,
    wabaId?: string,
    idempotencyKey?: string,
    expectedLastOutboundId?: string | null,
  ): Promise<WhatsAppMessage> {
    const type = String(content.type ?? '');
    if (
      !['image', 'video', 'audio', 'document', 'interactive'].includes(type) ||
      /\{\{[^}]+\}\}/.test(JSON.stringify(content))
    ) {
      throw new BadRequestException(
        'Choose supported, fully resolved media or interactive content',
      );
    }
    const { phone, credentials } = await this.serviceMessageRecipient(tenantId, to, wabaId);
    const capabilities = this.providers.get(credentials.provider).capabilities;
    if (!(type === 'interactive' ? capabilities.interactive : capabilities.media))
      throw new BadRequestException('The connected provider does not support this content');
    const data = content[type] as Record<string, unknown> | undefined;
    const body =
      type === 'interactive'
        ? String((data?.body as { text?: string } | undefined)?.text ?? '[Interactive message]')
        : `[${type}] ${typeof data?.caption === 'string' ? data.caption : ''}`.trim();
    return this.submitMessage(
      tenantId,
      phone,
      body,
      credentials,
      content,
      idempotencyKey,
      undefined,
      'SERVICE',
      expectedLastOutboundId,
    );
  }

  async sendTemplateMessage(
    tenantId: string,
    to: string,
    templateName: string,
    language: string,
    components: unknown[] = [],
    wabaId?: string,
    idempotencyKey?: string,
    broadcastId?: string,
    expectedLastOutboundId?: string | null,
  ): Promise<WhatsAppMessage> {
    const credentials = await this.accounts.getCredentials(tenantId, wabaId);
    const template = await this.templates.findOne({
      where: {
        tenantId,
        businessAccountId: credentials.businessAccountId,
        name: templateName,
        language,
        status: WhatsAppTemplateStatus.APPROVED,
      },
    });
    if (!template?.waTemplateId)
      throw new BadRequestException(
        'An approved, synchronized template in the requested language is required',
      );
    const phone = this.consent.normalizePhone(to);
    const eligibility = await this.consent.getEligibility(tenantId, phone, template.category);
    if (!eligibility.eligible)
      throw new ForbiddenException(eligibility.reason ?? 'Recipient consent is required');
    if (/\{\{[^}]+\}\}/.test(JSON.stringify(components)))
      throw new BadRequestException('Resolve all template variables before sending');
    return this.submitMessage(
      tenantId,
      phone,
      `[Template: ${templateName}]`,
      credentials,
      {
        type: 'template',
        template: { name: templateName, language: { code: language }, components },
      },
      idempotencyKey,
      broadcastId,
      template.category,
      expectedLastOutboundId,
    );
  }

  private async submitMessage(
    tenantId: string,
    to: string,
    body: string,
    credentials: WhatsappAccountCredentials,
    content: Record<string, unknown>,
    idempotencyKey: string = randomUUID(),
    broadcastId?: string,
    purpose: 'SERVICE' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' = 'SERVICE',
    expectedLastOutboundId?: string | null,
  ): Promise<WhatsAppMessage> {
    if (idempotencyKey.length > 200 || !/^[\w.:-]+$/.test(idempotencyKey))
      throw new BadRequestException('Invalid idempotency key');
    const tenant = await this.messages.manager.getRepository(Tenant).findOneBy({ id: tenantId });
    if (!tenant || tenant.status !== 'ACTIVE') throw new ForbiddenException('Tenant is not active');
    if (!(await this.pricing.isFeatureEnabled(tenantId, 'whatsapp')))
      throw new ForbiddenException('Your subscription does not include WhatsApp');
    const requestHash = createHash('sha256')
      .update(JSON.stringify({ to, content, account: credentials.phoneNumberId }))
      .digest('hex');
    const limits = await this.pricing.getAllLimits(tenantId);
    const limit = limits.whatsapp_messages;
    const bounds = resolveUsagePeriodBounds(
      await this.pricing.getLimitPeriod(tenantId, 'whatsapp_messages'),
    );
    const reservation = await this.messages.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        tenantId + ':whatsapp-sends',
      ]);
      const repo = manager.getRepository(WhatsAppMessage);
      const assertCampaignFrequency = async () => {
        if (!broadcastId) return;
        const campaign = await manager
          .getRepository(WhatsAppBroadcast)
          .findOneBy({ tenantId, id: broadcastId });
        if (!campaign) throw new NotFoundException('Broadcast not found');
        const cap = campaign.contactFilter.frequencyCap;
        if (!cap) return;
        // Reservations share the tenant send lock, so simultaneous campaigns cannot exceed this cap.
        const recent = await repo
          .createQueryBuilder('recent')
          .where('recent.tenantId=:tenantId AND recent.to=:to', { tenantId, to })
          .andWhere(
            "recent.direction='OUTBOUND' AND recent.broadcastId IS NOT NULL AND recent.status <> 'FAILED'",
          )
          .andWhere('recent.createdAt > :since', {
            since: new Date(Date.now() - cap.windowHours * 3600000),
          })
          .getCount();
        if (recent >= cap.maxMessages)
          throw new ForbiddenException(
            'Recipient campaign frequency cap reached; this message was suppressed',
          );
      };
      const assertUsageAvailable = async () => {
        if (limit === undefined || limit < 0) return;
        const used = await repo
          .createQueryBuilder('m')
          .where('m.tenantId = :tenantId', { tenantId })
          .andWhere("m.direction = 'OUTBOUND' AND m.createdAt BETWEEN :start AND :end", {
            start: bounds.periodStart,
            end: bounds.periodEnd,
          })
          .andWhere("(m.status IN ('SENDING','UNKNOWN') OR m.messageSid NOT LIKE 'pending_%')")
          .getCount();
        if (used >= limit) throw new ForbiddenException('WhatsApp message usage limit reached');
      };
      const existing = await repo.findOne({ where: { tenantId, idempotencyKey } });
      if (existing) {
        if (existing.requestHash !== requestHash)
          throw new ConflictException('Idempotency key was used for a different message');
        if (['SUBMITTED', 'SENT', 'DELIVERED', 'READ'].includes(existing.status))
          return { row: existing, send: false };
        if (existing.status === 'FAILED' && existing.retryAllowed) {
          await assertUsageAvailable();
          await assertCampaignFrequency();
          existing.status = 'SENDING';
          existing.retryAllowed = false;
          await repo.save(existing);
          return { row: existing, send: true };
        }
        throw new ConflictException(
          'This message already has an attempted delivery. Review its status before sending again.',
        );
      }
      await assertUsageAvailable();
      await assertCampaignFrequency();
      if (expectedLastOutboundId !== undefined) {
        const latest = await repo.findOne({
          where: { tenantId, phoneNumberId: credentials.phoneNumberId, to, direction: 'OUTBOUND' },
          order: { createdAt: 'DESC', id: 'DESC' },
        });
        if ((latest?.id ?? null) !== expectedLastOutboundId)
          throw new ConflictException(
            'Another reply was queued while you were composing. Refresh the conversation before sending.',
          );
        if (latest && ['SENDING', 'UNKNOWN'].includes(latest.status))
          throw new ConflictException(
            'The previous message has an uncertain delivery outcome. Reconcile it before sending again.',
          );
      }
      const row = await repo.save(
        repo.create({
          tenantId,
          to,
          from: credentials.phoneNumberId,
          phoneNumberId: credentials.phoneNumberId,
          messageSid: `pending_${randomUUID()}`,
          body,
          direction: 'OUTBOUND',
          status: 'SENDING',
          idempotencyKey,
          requestHash,
          broadcastId,
        }),
      );
      return { row, send: true };
    });
    if (!reservation.send) return reservation.row;
    const finalEligibility = await this.consent.getEligibility(tenantId, to, purpose);
    if (!finalEligibility.eligible) {
      await this.messages.update(
        { tenantId, id: reservation.row.id },
        {
          status: 'FAILED',
          errorReason: finalEligibility.reason ?? 'Recipient suppressed',
          retryAllowed: false,
        },
      );
      throw new ForbiddenException(finalEligibility.reason ?? 'Recipient is suppressed');
    }
    try {
      const { providerMessageId: providerId } = await this.providers
        .get(credentials.provider)
        .sendContent(credentials, to, content);
      await this.messages.manager.transaction(async (manager) => {
        await this.incrementUsage(manager, tenantId, bounds);
        await manager.update(
          WhatsAppMessage,
          { tenantId, id: reservation.row.id },
          { messageSid: providerId, status: 'SUBMITTED' },
        );
      });
      reservation.row.messageSid = providerId;
      reservation.row.status = 'SUBMITTED';
      this.eventEmitter.emit(EVENT_NAMES.MESSAGE_SENT, {
        tenantId,
        channel: 'whatsapp',
        phone: to,
        messageSid: providerId,
      });
      this.emitOutboundAccepted(tenantId, providerId);
      return reservation.row;
    } catch (error) {
      // A timeout or lost response is ambiguous: never automatically resend it.
      const definiteRejection = error instanceof WhatsappProviderError && !error.ambiguous;
      await this.messages.update(
        { tenantId, id: reservation.row.id },
        {
          status: definiteRejection ? 'FAILED' : 'UNKNOWN',
          retryAllowed: error instanceof WhatsappProviderError && error.retryable,
          errorReason: definiteRejection
            ? error.message
            : 'Provider acceptance is unknown; manual reconciliation is required',
        },
      );
      if (definiteRejection && error instanceof WhatsappProviderError) throw error;
      throw new BadRequestException(
        definiteRejection
          ? 'WhatsApp rejected the message; check account permissions and template parameters'
          : 'Message acceptance is unknown. Do not retry with a new key until reconciled.',
      );
    }
  }

  /** Takes the tenant usage lock first; callers must not hold other usage-related locks. */
  private async incrementUsage(
    manager: EntityManager,
    tenantId: string,
    bounds: ReturnType<typeof resolveUsagePeriodBounds>,
  ): Promise<void> {
    await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      tenantId + ':whatsapp-usage',
    ]);
    const usageRepo = manager.getRepository(UsageRecord);
    let usage = await usageRepo.findOne({
      where: {
        tenantId,
        metric: 'whatsapp_messages',
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
      },
    });
    if (!usage)
      usage = usageRepo.create({
        tenantId,
        metric: 'whatsapp_messages',
        ...bounds,
        quantity: 0,
      });
    usage.quantity = Number(usage.quantity) + 1;
    await usageRepo.save(usage);
  }

  private emitOutboundAccepted(tenantId: string, messageSid: string): void {
    const event: WhatsappOutboundAcceptedEvent = { tenantId, messageSid };
    this.eventEmitter.emit(WHATSAPP_OUTBOUND_ACCEPTED, event);
  }

  /**
   * Sweeper: SENDING/UNKNOWN rows older than the TTL become EXPIRED. EXPIRED does not block
   * replies, and with its pending_ SID it no longer counts toward the usage reservation.
   * A single conditional UPDATE, so concurrent replicas cannot double-apply it.
   */
  async expireUnconfirmedOutbound(): Promise<number> {
    const ttl =
      Number(this.configService.get('WHATSAPP_UNCONFIRMED_TTL_MS')) || DEFAULT_UNCONFIRMED_TTL_MS;
    const result = await this.messages
      .createQueryBuilder()
      .update(WhatsAppMessage)
      .set({
        status: 'EXPIRED',
        retryAllowed: false,
        errorReason:
          'Delivery was never confirmed by WhatsApp; verify with the recipient or reconcile manually',
      })
      .where(
        "direction = 'OUTBOUND' AND status IN ('SENDING','UNKNOWN') AND updated_at < :cutoff",
        {
          cutoff: new Date(Date.now() - ttl),
        },
      )
      .execute();
    return result.affected ?? 0;
  }

  /** Operator decision for an outbound message whose provider outcome was never confirmed. */
  async reconcileMessage(
    tenantId: string,
    id: string,
    outcome: 'SENT' | 'FAILED',
    providerMessageId?: string,
  ): Promise<WhatsAppMessage> {
    if (providerMessageId !== undefined && !/^[\w.:=+/-]{1,200}$/.test(providerMessageId))
      throw new BadRequestException('Invalid WhatsApp message ID');
    const bounds =
      outcome === 'SENT'
        ? resolveUsagePeriodBounds(await this.pricing.getLimitPeriod(tenantId, 'whatsapp_messages'))
        : undefined;
    const row = await this.messages.manager.transaction(async (manager) => {
      // Same lock order as the send path: usage lock before the message row.
      if (bounds) await this.incrementUsage(manager, tenantId, bounds);
      const repo = manager.getRepository(WhatsAppMessage);
      const message = await repo.findOne({
        where: { tenantId, id, direction: 'OUTBOUND' },
        lock: { mode: 'pessimistic_write' },
      });
      if (!message) throw new NotFoundException('WhatsApp message not found');
      if (!['UNKNOWN', 'EXPIRED'].includes(message.status))
        throw new ConflictException('Only messages with an unconfirmed outcome can be reconciled');
      if (providerMessageId && (await repo.exists({ where: { messageSid: providerMessageId } })))
        throw new ConflictException('This WhatsApp message ID is already recorded');
      if (outcome === 'SENT') {
        message.status = 'SENT';
        // A non-pending SID makes the message count toward usage, matching the increment above.
        message.messageSid = providerMessageId ?? `manual_${message.id}`;
        message.errorReason = 'Marked as sent during manual reconciliation';
        message.retryAllowed = false;
      } else {
        message.status = 'FAILED';
        message.errorReason = 'Marked as not sent during manual reconciliation';
        message.retryAllowed = true;
      }
      return repo.save(message);
    });
    if (providerMessageId) this.emitOutboundAccepted(tenantId, providerMessageId);
    return row;
  }

  async getAnalytics(tenantId: string, from?: string, to?: string, limit = 50) {
    if (from && to && Date.parse(from) >= Date.parse(to))
      throw new BadRequestException('Analytics start must be earlier than the exclusive end');
    const messageQuery = this.messages
      .createQueryBuilder('m')
      .select('m.direction', 'direction')
      .addSelect('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId });
    if (from) messageQuery.andWhere('m.createdAt >= :from', { from });
    if (to) messageQuery.andWhere('m.createdAt < :to', { to });
    const rows = await messageQuery
      .groupBy('m.direction')
      .addGroupBy('m.status')
      .getRawMany<{ direction: string; status: string; count: string }>();
    const counts: Record<string, number> = {};
    for (const row of rows)
      counts[`${row.direction.toLowerCase()}_${row.status.toLowerCase()}`] = Number(row.count);
    const incoming = rows
      .filter((r) => r.direction === 'INBOUND')
      .reduce((sum, r) => sum + Number(r.count), 0);
    const outgoing = rows
      .filter((r) => r.direction === 'OUTBOUND')
      .reduce((sum, r) => sum + Number(r.count), 0);
    const csat = await this.contactRepository
      .createQueryBuilder('c')
      .select(
        "COUNT(*) FILTER (WHERE c.custom_fields->'whatsappCsat'->>'status'='RECEIVED')",
        'responses',
      )
      .addSelect(
        "AVG(CASE WHEN c.custom_fields->'whatsappCsat'->>'rating' ~ '^[1-5]$' THEN (c.custom_fields->'whatsappCsat'->>'rating')::numeric END)",
        'average',
      )
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere("c.custom_fields->'whatsappCsat'->>'status'='RECEIVED'")
      .andWhere(
        "(:from::text IS NULL OR c.custom_fields->'whatsappCsat'->>'receivedAt' >= :from)",
        { from: from ?? null },
      )
      .andWhere("(:to::text IS NULL OR c.custom_fields->'whatsappCsat'->>'receivedAt' < :to)", {
        to: to ?? null,
      })
      .getRawOne<{ responses: string; average: string | null }>();
    const broadcasts = this.messages.manager
      .getRepository(WhatsAppBroadcast)
      .createQueryBuilder('b')
      .where('b.tenantId = :tenantId', { tenantId });
    if (from) broadcasts.andWhere('b.createdAt >= :from', { from });
    if (to) broadcasts.andWhere('b.createdAt < :to', { to });
    const [broadcastSummary, broadcastItems] = await Promise.all([
      broadcasts
        .clone()
        .select('COUNT(*)', 'campaigns')
        .addSelect('COALESCE(SUM(b.total), 0)', 'recipients')
        .addSelect('COALESCE(SUM(b.sent), 0)', 'sent')
        .addSelect('COALESCE(SUM(b.delivered), 0)', 'delivered')
        .addSelect('COALESCE(SUM(b.read), 0)', 'read')
        .addSelect('COALESCE(SUM(b.failed), 0)', 'failed')
        .getRawOne<Record<string, string>>(),
      broadcasts
        .clone()
        .select('b.id', 'id')
        .addSelect('b.name', 'name')
        .addSelect('b.status', 'status')
        .addSelect('b.createdAt', 'createdAt')
        .addSelect('b.total', 'total')
        .addSelect('b.sent', 'sent')
        .addSelect('b.delivered', 'delivered')
        .addSelect('b.read', 'read')
        .addSelect('b.failed', 'failed')
        .orderBy('b.createdAt', 'DESC')
        .take(limit)
        .getRawMany<{
          id: string;
          name: string;
          status: string;
          createdAt: Date;
          total: number;
          sent: number;
          delivered: number;
          read: number;
          failed: number;
        }>(),
    ]);
    const workflowRuns = this.messages.manager
      .getRepository(WorkflowExecution)
      .createQueryBuilder('e')
      .innerJoin(Flow, 'f', 'f.id = e.flowId AND f.tenantId = e.tenantId AND f.deletedAt IS NULL')
      .where('e.tenantId = :tenantId', { tenantId })
      .andWhere('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.type = :type', { type: 'whatsapp' });
    if (from) workflowRuns.andWhere('e.startedAt >= :from', { from });
    if (to) workflowRuns.andWhere('e.startedAt < :to', { to });
    const [workflowStatusRows, workflowRunItems] = await Promise.all([
      workflowRuns
        .clone()
        .select('e.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('e.status')
        .getRawMany<{ status: string; count: string }>(),
      workflowRuns
        .clone()
        .select('e.id', 'id')
        .addSelect('e.flowId', 'flowId')
        .addSelect('f.name', 'workflowName')
        .addSelect('e.status', 'status')
        .addSelect('e.startedAt', 'startedAt')
        .addSelect('e.completedAt', 'completedAt')
        .addSelect("e.input ->> 'eventName'", 'eventName')
        .orderBy('e.startedAt', 'DESC')
        .take(limit)
        .getRawMany<{
          id: string;
          flowId: string;
          workflowName: string;
          status: string;
          startedAt: Date;
          completedAt: Date | null;
          eventName: string | null;
        }>(),
    ]);
    const campaignStatuses = await broadcasts
      .clone()
      .select('b.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('b.status')
      .getRawMany<{ status: string; count: string }>();
    return {
      total: incoming + outgoing,
      inbound: incoming,
      outbound: outgoing,
      counts,
      submitted: ['SUBMITTED', 'SENT', 'DELIVERED', 'READ'].reduce(
        (sum, status) => sum + (counts[`outbound_${status.toLowerCase()}`] ?? 0),
        0,
      ),
      delivered: (counts.outbound_delivered ?? 0) + (counts.outbound_read ?? 0),
      read: counts.outbound_read ?? 0,
      failed: counts.outbound_failed ?? 0,
      unknown: counts.outbound_unknown ?? 0,
      expired: counts.outbound_expired ?? 0,
      csat: {
        responses: Number(csat?.responses ?? 0),
        average:
          csat?.average === null || csat?.average === undefined ? null : Number(csat.average),
      },
      cost: null,
      revenueAttribution: null,
      campaigns: {
        summary: {
          count: Number(broadcastSummary?.campaigns ?? 0),
          recipients: Number(broadcastSummary?.recipients ?? 0),
          sent: Number(broadcastSummary?.sent ?? 0),
          delivered: Number(broadcastSummary?.delivered ?? 0),
          read: Number(broadcastSummary?.read ?? 0),
          failed: Number(broadcastSummary?.failed ?? 0),
          statuses: Object.fromEntries(
            campaignStatuses.map((row) => [row.status, Number(row.count)]),
          ),
        },
        items: broadcastItems,
      },
      automationRuns: {
        summary: {
          count: workflowStatusRows.reduce((sum, row) => sum + Number(row.count), 0),
          statuses: Object.fromEntries(
            workflowStatusRows.map((row) => [row.status, Number(row.count)]),
          ),
        },
        items: workflowRunItems,
      },
      ...(await this.calculateInboxSLA(tenantId, from, to)),
    };
  }

  async listMessages(tenantId: string, page = 1, limit = 50): Promise<WhatsAppMessage[]> {
    return this.messageRepository.findAll(tenantId, {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async listConversations(
    tenantId: string,
    page = 1,
    limit = 50,
    phone?: string,
    phoneNumberId?: string,
  ): Promise<WhatsappConversationSummary[]> {
    if (phone !== undefined) phone = this.consent.normalizePhone(phone);
    const [rows] = await this.messageRepository.findConversationSummaries(
      tenantId,
      page,
      limit,
      phone,
      phoneNumberId,
    );
    return Promise.all(
      rows.map(async (row) => {
        const lastInboundAt = row.latestInboundAt ?? undefined;
        const windowExpiresAt = lastInboundAt
          ? new Date(lastInboundAt.getTime() + 86400000)
          : undefined;
        const eligibility = await this.consent.getEligibility(tenantId, row.phone, 'SERVICE');
        const canReply = eligibility.eligible && (windowExpiresAt?.getTime() ?? 0) > Date.now();
        return {
          phone: row.phone,
          contactName: row.contactName ?? undefined,
          lastMessage: row.lastMessage,
          lastMessageAt: row.lastMessageAt,
          direction: row.direction,
          messageCount: Number(row.messageCount),
          unreadCount: Number(row.unreadCount),
          assigneeId: row.assigneeId ?? undefined,
          teamId: row.teamId ?? undefined,
          status: row.status === 'RESOLVED' ? 'RESOLVED' : 'OPEN',
          lastInboundAt: lastInboundAt ?? undefined,
          windowExpiresAt,
          canReply,
          replyBlockedReason:
            eligibility.reason ??
            (canReply ? undefined : 'Use an approved template outside the customer-service window'),
          phoneNumberId: row.phoneNumberId ?? undefined,
          priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(row.priority ?? '')
            ? (row.priority as WhatsappConversationSummary['priority'])
            : 'NORMAL',
          tags: row.tags ?? [],
          awaitingReplyCount: Number(row.awaitingReplyCount),
          csatStatus: row.csatStatus as WhatsappCsatStatus | undefined,
          csatRating: row.csatRating ? Number(row.csatRating) : undefined,
        };
      }),
    );
  }

  async getConversation(
    tenantId: string,
    phone: string,
    phoneNumberId?: string,
    page = 1,
    limit = 50,
  ): Promise<WhatsAppMessage[]> {
    phone = this.consent.normalizePhone(phone);
    const messages = await this.messageRepository.findConversation(
      tenantId,
      phone,
      phoneNumberId,
      page,
      limit,
    );
    return messages.reverse();
  }

  async downloadMessageMedia(
    tenantId: string,
    messageId: string,
    index: number,
  ): Promise<WhatsappMediaDownload> {
    if (!Number.isSafeInteger(index) || index < 0 || index > 9)
      throw new BadRequestException('Invalid media index');
    const message = await this.messages.findOne({ where: { tenantId, id: messageId } });
    const mediaId = message?.mediaUrls?.[index];
    if (
      !message ||
      message.direction !== 'INBOUND' ||
      !message.phoneNumberId ||
      typeof mediaId !== 'string' ||
      !/^[0-9]{1,128}$/.test(mediaId)
    ) {
      throw new NotFoundException('WhatsApp media not found');
    }
    const credentials = await this.accounts.getCredentials(tenantId, message.phoneNumberId);
    return this.providers.get(credentials.provider).downloadMedia(credentials, mediaId);
  }

  async updateConversation(tenantId: string, input: string, dto: UpdateWhatsappConversationDto) {
    const phone = this.consent.normalizePhone(input);
    const contact = await this.consent.findContact(tenantId, phone);
    if (!contact) throw new NotFoundException('CRM contact for this conversation was not found');
    const eventId = `whatsapp-conversation-status:${randomUUID()}`;
    const transition = await this.contactRepository.manager.transaction(async (manager) => {
      const row = await manager
        .getRepository(Contact)
        .findOne({ where: { tenantId, id: contact.id }, lock: { mode: 'pessimistic_write' } });
      if (!row) throw new NotFoundException('Contact was removed');
      const previousStatus = row.customFields?.whatsappStatus === 'RESOLVED' ? 'RESOLVED' : 'OPEN';
      const nextStatus = dto.status ?? previousStatus;
      if (dto.tags !== undefined)
        row.tags = [...new Set(dto.tags.map((tag) => tag.trim()).filter(Boolean))];
      row.customFields = {
        ...row.customFields,
        ...(dto.status ? { whatsappStatus: dto.status } : {}),
        ...(dto.status === 'RESOLVED' ? { whatsappReadAt: new Date().toISOString() } : {}),
        ...(dto.priority ? { whatsappPriority: dto.priority } : {}),
      };
      await manager.save(row);
      return previousStatus === nextStatus
        ? null
        : { eventName: this.conversationTransitionName(nextStatus), contactId: row.id };
    });
    if (transition)
      await this.emitConversationTransition(
        transition.eventName,
        tenantId,
        phone,
        transition.contactId,
        (await this.latestConversationPhoneNumberId(tenantId, phone)) ?? undefined,
        eventId,
      );
    return { phone, ...dto };
  }

  private async latestConversationPhoneNumberId(
    tenantId: string,
    phone: string,
  ): Promise<string | null> {
    const latest = await this.messages.findOne({
      where: [
        { tenantId, from: phone },
        { tenantId, to: phone },
      ],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return latest?.phoneNumberId ?? null;
  }

  private conversationTransitionName(status: 'OPEN' | 'RESOLVED') {
    return status === 'RESOLVED'
      ? EVENT_NAMES.WHATSAPP_CONVERSATION_RESOLVED
      : EVENT_NAMES.WHATSAPP_CONVERSATION_REOPENED;
  }

  private async emitConversationTransition(
    eventName: string,
    tenantId: string,
    phone: string,
    contactId: string,
    phoneNumberId: string | undefined,
    eventId: string,
  ): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, {
      tenantId,
      phone,
      contactId,
      phoneNumberId,
      status: eventName === EVENT_NAMES.WHATSAPP_CONVERSATION_RESOLVED ? 'RESOLVED' : 'OPEN',
      eventId,
    });
  }

  async markConversationRead(tenantId: string, input: string) {
    const phone = this.consent.normalizePhone(input);
    const contact = await this.consent.findContact(tenantId, phone);
    if (!contact) throw new NotFoundException('Conversation contact was not found');
    await this.contactRepository
      .createQueryBuilder()
      .update()
      .set({
        customFields: () =>
          `jsonb_set(COALESCE(custom_fields, '{}'::jsonb), '{whatsappReadAt}', to_jsonb(CAST(:readAt AS text)), true)`,
      })
      .setParameter('readAt', new Date().toISOString())
      .where({ id: contact.id, tenantId })
      .execute();
    return { phone, read: true };
  }

  async conversationNotes(tenantId: string, input: string) {
    const contact = await this.consent.findContact(tenantId, this.consent.normalizePhone(input));
    if (!contact) throw new NotFoundException('Conversation contact was not found');
    return this.messages.manager.getRepository(Note).find({
      where: { tenantId, contactId: contact.id, tags: ArrayContains(['whatsapp']) },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async addConversationNote(tenantId: string, input: string, content: string, authorId: string) {
    if (!content.trim()) throw new BadRequestException('An internal note must contain text');
    const contact = await this.consent.findContact(tenantId, this.consent.normalizePhone(input));
    if (!contact) throw new NotFoundException('Conversation contact was not found');
    const notes = this.messages.manager.getRepository(Note);
    return notes.save(
      notes.create({
        tenantId,
        contactId: contact.id,
        title: 'WhatsApp internal note',
        content: content.trim(),
        authorId,
        tags: ['whatsapp'],
      }),
    );
  }

  async assignConversation(
    tenantId: string,
    phone: string,
    assigneeId: string,
  ): Promise<WhatsappConversationSummary> {
    if (
      !(await this.users.exists({ where: { id: assigneeId, tenantId, status: UserStatus.ACTIVE } }))
    )
      throw new BadRequestException('Assignee must be an active member of this tenant');
    phone = this.consent.normalizePhone(phone);
    const contact = await this.findOrCreateContactByPhone(tenantId, phone);
    contact.ownerId = assigneeId;
    contact.customFields = {
      ...contact.customFields,
      whatsappStatus: 'OPEN',
      whatsappTeamId: null,
    };
    await this.contactRepository.save(contact);
    const summaries = await this.listConversations(tenantId, 1, 1, phone);
    const summary = summaries.find((item) => item.phone === phone);
    if (!summary) {
      throw new NotFoundException('Conversation not found');
    }
    return { ...summary, assigneeId, status: 'OPEN' };
  }

  async assignConversationRoundRobin(
    tenantId: string,
    input: string,
    availableUserIds?: string[],
  ): Promise<WhatsappConversationSummary> {
    const phone = this.consent.normalizePhone(input);
    if (!(await this.users.exists({ where: { tenantId, status: UserStatus.ACTIVE } })))
      throw new BadRequestException('No active teammates can receive this conversation');
    const contact = await this.findOrCreateContactByPhone(tenantId, phone);
    const assigneeId = await this.contactRepository.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `${tenantId}:whatsapp-round-robin`,
      ]);
      const users = await manager.getRepository(UserEntity).find({
        where: availableUserIds
          ? { tenantId, status: UserStatus.ACTIVE, id: In(availableUserIds) }
          : { tenantId, status: UserStatus.ACTIVE },
        order: { id: 'ASC' },
      });
      if (!users.length)
        throw new BadRequestException(
          availableUserIds?.length
            ? 'No online teammates can receive this conversation'
            : 'No active teammates can receive this conversation',
        );
      const lastAssignment: { assigneeId: string } | undefined = await manager
        .getRepository(Contact)
        .createQueryBuilder('contact')
        .select('contact.ownerId', 'assigneeId')
        .where('contact.tenantId = :tenantId', { tenantId })
        .andWhere("contact.customFields ->> 'whatsappAssignmentMode' = 'ROUND_ROBIN'")
        .orderBy("contact.customFields ->> 'whatsappAssignedAt'", 'DESC')
        .addOrderBy('contact.id', 'DESC')
        .getRawOne();
      const assignee =
        users.find((user) => user.id.localeCompare(lastAssignment?.assigneeId ?? '') > 0) ??
        users[0];
      const row = await manager.getRepository(Contact).findOne({
        where: { tenantId, id: contact.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!row) throw new NotFoundException('Conversation contact was removed');
      row.ownerId = assignee.id;
      row.customFields = {
        ...row.customFields,
        whatsappStatus: 'OPEN',
        whatsappTeamId: null,
        whatsappAssignmentMode: 'ROUND_ROBIN',
        whatsappAssignedAt: new Date().toISOString(),
      };
      await manager.save(row);
      return assignee.id;
    });
    const summary = (await this.listConversations(tenantId, 1, 1, phone))[0];
    if (!summary) throw new NotFoundException('Conversation not found');
    return { ...summary, assigneeId, status: 'OPEN' };
  }

  async assignConversationToOnlineTeammate(tenantId: string, input: string) {
    const onlineUserIds = await this.getOnlineInboxAgentIds(tenantId);
    if (!onlineUserIds.length)
      throw new BadRequestException('No teammates are currently online in the WhatsApp inbox');
    return this.assignConversationRoundRobin(tenantId, input, onlineUserIds);
  }

  async assignConversationToTeam(tenantId: string, input: string, teamId: string) {
    const phone = this.consent.normalizePhone(input);
    const contact = await this.findOrCreateContactByPhone(tenantId, phone);
    const assigneeId = await this.contactRepository.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `${tenantId}:whatsapp-team:${teamId}`,
      ]);
      const team = await manager.getRepository(TeamGroup).findOne({
        where: { id: teamId, tenantId },
        relations: ['members'],
      });
      if (!team) throw new NotFoundException('Team not found in this tenant');
      const members = team.members
        .filter((member) => member.status === UserStatus.ACTIVE && member.tenantId === tenantId)
        .sort((left, right) => left.id.localeCompare(right.id));
      if (!members.length) throw new BadRequestException('This team has no active members');
      const lastAssignment: { assigneeId: string } | undefined = await manager
        .getRepository(Contact)
        .createQueryBuilder('contact')
        .select('contact.ownerId', 'assigneeId')
        .where('contact.tenantId = :tenantId', { tenantId })
        .andWhere("contact.customFields ->> 'whatsappTeamId' = :teamId", { teamId })
        .orderBy("contact.customFields ->> 'whatsappAssignedAt'", 'DESC')
        .addOrderBy('contact.id', 'DESC')
        .getRawOne();
      const assignee =
        members.find((member) => member.id.localeCompare(lastAssignment?.assigneeId ?? '') > 0) ??
        members[0];
      const row = await manager.getRepository(Contact).findOne({
        where: { tenantId, id: contact.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!row) throw new NotFoundException('Conversation contact was removed');
      row.ownerId = assignee.id;
      row.customFields = {
        ...row.customFields,
        whatsappStatus: 'OPEN',
        whatsappTeamId: team.id,
        whatsappAssignmentMode: 'TEAM_ROUND_ROBIN',
        whatsappAssignedAt: new Date().toISOString(),
      };
      await manager.save(row);
      return assignee.id;
    });
    const summary = (await this.listConversations(tenantId, 1, 1, phone))[0];
    if (!summary) throw new NotFoundException('Conversation not found');
    return { ...summary, assigneeId, teamId, status: 'OPEN' as const };
  }

  async resolveConversation(tenantId: string, phone: string): Promise<WhatsappConversationSummary> {
    phone = this.consent.normalizePhone(phone);
    const contact = await this.findOrCreateContactByPhone(tenantId, phone);
    if (contact) await this.updateConversation(tenantId, phone, { status: 'RESOLVED' });

    const summaries = await this.listConversations(tenantId, 1, 1, phone);
    const summary = summaries.find((item) => item.phone === phone);
    if (!summary) {
      throw new NotFoundException('Conversation not found');
    }
    return { ...summary, status: 'RESOLVED', unreadCount: 0 };
  }

  async requestConversationCsat(tenantId: string, input: string) {
    const phone = this.consent.normalizePhone(input);
    const contact = await this.findContactByPhone(tenantId, phone);
    if (!contact || contact.customFields?.whatsappStatus !== 'RESOLVED') {
      throw new BadRequestException('Resolve the conversation before requesting feedback');
    }
    const inbound = await this.messages.findOne({
      where: { tenantId, from: phone, direction: 'INBOUND' },
      order: { providerTimestamp: 'DESC', createdAt: 'DESC' },
    });
    if (
      !inbound?.phoneNumberId ||
      !inbound.providerTimestamp ||
      inbound.providerTimestamp.getTime() + 86400000 <= Date.now()
    ) {
      throw new BadRequestException(
        'The customer-service window is closed; feedback request not sent',
      );
    }
    const current = contact.customFields?.whatsappCsat as
      | { status?: string; requestKey?: string; requestedAt?: string; rating?: number }
      | undefined;
    const requestKey =
      ['SENDING', 'REQUESTED'].includes(current?.status ?? '') && current?.requestKey
        ? current.requestKey
        : `csat-${randomUUID()}`;
    contact.customFields = {
      ...contact.customFields,
      whatsappCsat: {
        status: 'SENDING',
        requestKey,
        phone,
        requestedAt: ['SENDING', 'REQUESTED'].includes(current?.status ?? '')
          ? current?.requestedAt
          : new Date().toISOString(),
      },
    };
    await this.contactRepository.save(contact);
    const message = await this.sendTextMessage(
      tenantId,
      phone,
      'How was your support experience? Reply with a rating from 1 (poor) to 5 (excellent).',
      inbound.phoneNumberId,
      requestKey,
    );
    const latestContact = await this.findContactByPhone(tenantId, phone);
    const latestCsat = this.csatState(latestContact);
    if (latestContact && latestCsat?.requestKey === requestKey && latestCsat.status === 'SENDING') {
      latestContact.customFields = {
        ...latestContact.customFields,
        whatsappCsat: { ...latestCsat, status: 'REQUESTED' },
      };
      await this.contactRepository.save(latestContact);
    }
    return { status: 'REQUESTED' as const, messageId: message.id };
  }

  private csatState(contact?: Contact | null):
    | {
        status?: WhatsappCsatStatus;
        requestKey?: string;
        requestedAt?: string;
        phone?: string;
        rating?: number;
      }
    | undefined {
    return contact?.customFields?.whatsappCsat as
      | {
          status?: WhatsappCsatStatus;
          requestKey?: string;
          requestedAt?: string;
          phone?: string;
          rating?: number;
        }
      | undefined;
  }

  private async captureCsatReply(
    contact: Contact,
    senderPhone: string,
    text: string,
    messageSid: string,
  ): Promise<boolean> {
    const csat = this.csatState(contact);
    if (!csat || (csat.status !== 'SENDING' && csat.status !== 'REQUESTED')) return false;
    if (csat.phone !== senderPhone) return false;
    const age = Date.now() - Date.parse(csat.requestedAt ?? '');
    const rating = /^[1-5]$/.test(text.trim()) ? Number(text.trim()) : undefined;
    contact.customFields = {
      ...contact.customFields,
      whatsappCsat:
        Number.isFinite(age) && age >= 0 && age <= 7 * 86400000 && rating
          ? {
              ...csat,
              status: 'RECEIVED',
              rating,
              receivedAt: new Date().toISOString(),
              responseMessageSid: messageSid,
            }
          : {
              ...csat,
              status: Number.isFinite(age) && age <= 7 * 86400000 ? 'CANCELLED' : 'EXPIRED',
            },
    };
    await this.contactRepository.save(contact);
    return !!(Number.isFinite(age) && age >= 0 && age <= 7 * 86400000 && rating);
  }

  private describeMediaMessage(type: string, message: Record<string, unknown>): string {
    switch (type) {
      case 'image':
        return '[Image]';
      case 'video':
        return '[Video]';
      case 'audio':
        return '[Audio]';
      case 'document':
        return `[Document] ${String((message.document as { filename?: string } | undefined)?.filename ?? '')}`.trim();
      case 'sticker':
        return '[Sticker]';
      case 'location':
        return '[Location]';
      default:
        return '[Media/Unsupported]';
    }
  }

  private extractMediaUrls(type: string, message: Record<string, unknown>): string[] {
    const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];
    if (!mediaTypes.includes(type)) {
      return [];
    }

    const media = message[type] as { id?: string } | undefined;
    return typeof media?.id === 'string' && /^[0-9]{1,128}$/.test(media.id) ? [media.id] : [];
  }

  private async findContactByPhone(tenantId: string, phone: string): Promise<Contact | null> {
    return this.consent.findContact(tenantId, this.consent.normalizePhone(phone));
  }

  private async findOrCreateContactByPhone(tenantId: string, phone: string): Promise<Contact> {
    const normalizedPhone = this.consent.normalizePhone(phone);
    return this.contactRepository.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `${tenantId}:whatsapp-contact:${normalizedPhone}`,
      ]);
      const contacts = manager.getRepository(Contact);
      const existing = await contacts
        .createQueryBuilder('contact')
        .where('contact.tenantId = :tenantId', { tenantId })
        .andWhere(
          "(regexp_replace(contact.phone, '[^0-9]', '', 'g') = :phone OR regexp_replace(contact.mobile, '[^0-9]', '', 'g') = :phone)",
          { phone: normalizedPhone },
        )
        .orderBy('contact.createdAt', 'ASC')
        .addOrderBy('contact.id', 'ASC')
        .getOne();
      if (existing) return existing;

      return contacts.save(
        contacts.create({
          tenantId,
          firstName: normalizedPhone,
          lastName: '',
          email: `whatsapp-${normalizedPhone}@placeholder.local`,
          mobile: normalizedPhone,
          customFields: { whatsappStatus: 'OPEN' },
        }),
      );
    });
  }

  async calculateInboxSLA(
    tenantId: string,
    from?: string,
    to?: string,
  ): Promise<{ averageResponseTimeMs: number; breached: number }> {
    const slaThresholdMs = this.getSlaThresholdMs();
    const result = await this.messageRepository.getInboxSla(tenantId, slaThresholdMs, from, to);
    return {
      averageResponseTimeMs: Math.round(Number(result.average ?? 0)),
      breached: Number(result.breached ?? 0),
    };
  }

  getSlaThresholdMs(): number {
    const configured = Number(this.configService.get('WHATSAPP_SLA_MS'));
    return Number.isFinite(configured) && configured >= 60000 && configured <= 86400000
      ? configured
      : DEFAULT_SLA_MS;
  }

  async escalateConversationSla({
    tenantId,
    phoneNumberId,
    phone: input,
    messageSid,
  }: WhatsappSlaCheckPayload): Promise<boolean> {
    const phone = this.consent.normalizePhone(input);
    return this.messages.manager.transaction(async (manager) => {
      const contact = await manager
        .getRepository(Contact)
        .createQueryBuilder('contact')
        .where('contact.tenantId = :tenantId', { tenantId })
        .andWhere(
          "(regexp_replace(COALESCE(contact.phone, ''), '[^0-9]', '', 'g') = :phone OR regexp_replace(COALESCE(contact.mobile, ''), '[^0-9]', '', 'g') = :phone)",
          { phone },
        )
        .setLock('pessimistic_write')
        .getOne();
      if (!contact || contact.customFields?.whatsappStatus === 'RESOLVED' || !contact.ownerId)
        return false;
      const assignee = await manager.getRepository(UserEntity).findOne({
        where: { id: contact.ownerId, tenantId, status: UserStatus.ACTIVE },
        select: { id: true },
      });
      if (!assignee) return false;

      const messageRepository = manager.getRepository(WhatsAppMessage);
      const latestInbound = await messageRepository
        .createQueryBuilder('message')
        .where('message.tenantId = :tenantId', { tenantId })
        .andWhere('message.phoneNumberId = :phoneNumberId', { phoneNumberId })
        .andWhere('message.direction = :direction AND message.from = :phone', {
          direction: 'INBOUND',
          phone,
        })
        .orderBy('message.createdAt', 'DESC')
        .addOrderBy('message.id', 'DESC')
        .getOne();
      const receivedAt = latestInbound?.providerTimestamp ?? latestInbound?.createdAt;
      if (
        latestInbound?.messageSid !== messageSid ||
        !receivedAt ||
        Date.now() - receivedAt.getTime() < this.getSlaThresholdMs() ||
        contact.customFields?.whatsappLastSlaEscalationMessageId === messageSid
      )
        return false;

      const replied = await messageRepository
        .createQueryBuilder('message')
        .where('message.tenantId = :tenantId', { tenantId })
        .andWhere('message.phoneNumberId = :phoneNumberId', { phoneNumberId })
        .andWhere('message.direction = :direction AND message.to = :phone', {
          direction: 'OUTBOUND',
          phone,
        })
        .andWhere('message.status <> :failed', { failed: 'FAILED' })
        .andWhere('message.createdAt > :receivedAt', { receivedAt: latestInbound.createdAt })
        .getExists();
      if (replied) return false;

      contact.customFields = {
        ...contact.customFields,
        whatsappLastSlaEscalationMessageId: messageSid,
        whatsappLastSlaEscalatedAt: new Date().toISOString(),
      };
      await manager.getRepository(Contact).save(contact);
      const notifications = manager.getRepository(Notification);
      await notifications.save(
        notifications.create({
          tenantId,
          userId: assignee.id,
          type: 'IN_APP',
          title: 'WhatsApp conversation needs a reply',
          content: `A conversation is still awaiting a reply after ${Math.round(this.getSlaThresholdMs() / 60000)} minutes. Open the WhatsApp inbox to respond.`,
          meta: { contactId: contact.id, phoneNumberId, messageSid, kind: 'WHATSAPP_SLA' },
        }),
      );
      return true;
    });
  }

  getFlowBuilderNodes(_tenantId: string): WhatsappFlowNodeDefinition[] {
    return [
      { type: 'TRIGGER_KEYWORD', label: 'Keyword Trigger', configSchema: { keyword: 'string' } },
      { type: 'SEND_MESSAGE', label: 'Send Message', configSchema: { text: 'string' } },
      { type: 'SEND_TEMPLATE', label: 'Send Template', configSchema: { templateId: 'uuid' } },
      {
        type: 'LOOKUP_SHOPIFY_ORDER',
        label: 'Look up Shopify order (requires connected store)',
        configSchema: { orderName: 'string' },
      },
      {
        type: 'CONDITION',
        label: 'Condition Branch',
        configSchema: { field: 'string', operator: 'string', value: 'string' },
      },
      {
        type: 'DELAY',
        label: 'Delay',
        configSchema: { delayMinutes: 'number' },
      },
      { type: 'ASSIGN_AGENT', label: 'Assign Agent', configSchema: { assigneeId: 'uuid' } },
      { type: 'RESOLVE', label: 'Resolve Conversation', configSchema: {} },
      {
        type: 'WAIT_FOR_REPLY',
        label: 'Wait for reply',
        configSchema: { timeoutMinutes: 'number' },
      },
      {
        type: 'WAIT_UNTIL',
        label: 'Wait for condition',
        configSchema: {
          field: 'string',
          operator: 'string',
          value: 'string',
          timeoutMinutes: 'number',
        },
      },
      {
        type: 'CREATE_TASK',
        label: 'Create CRM task',
        configSchema: { title: 'string', assigneeId: 'uuid', dueInHours: 'number' },
      },
      {
        type: 'CREATE_LEAD',
        label: 'Create CRM lead from inquiry',
        configSchema: {
          firstName: 'string',
          lastName: 'string',
          phone: 'string',
          email: 'string',
          source: 'string',
        },
      },
      {
        type: 'CREATE_NOTE',
        label: 'Create CRM note',
        configSchema: { contactId: 'string', title: 'string', content: 'string' },
      },
      {
        type: 'ADD_TAG',
        label: 'Add contact tag',
        configSchema: { contactId: 'string', tag: 'string' },
      },
      {
        type: 'NOTIFY_TEAM',
        label: 'Notify teammate',
        configSchema: { userId: 'uuid', title: 'string', message: 'string' },
      },
    ];
  }
}
