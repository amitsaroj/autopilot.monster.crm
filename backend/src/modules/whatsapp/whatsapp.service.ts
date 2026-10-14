import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { ArrayContains, Repository } from 'typeorm';

import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WhatsAppBroadcast } from '../../database/entities/whatsapp-broadcast.entity';
import { Contact } from '../../database/entities/contact.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { Tenant } from '../../database/entities/tenant.entity';
import { env } from '../../config/env.config';
import { WhatsappAccountService } from './whatsapp-account.service';
import type { WhatsappAccountCredentials } from './whatsapp-account.service';
import { WhatsappProviderRegistry, WhatsappProviderError } from './whatsapp-provider';
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
import { UpdateWhatsappConversationDto } from './dto/whatsapp-conversation.dto';

export type WhatsappConversationStatus = 'OPEN' | 'RESOLVED';

export interface WhatsappConversationSummary {
  phone: string;
  contactName?: string;
  lastMessage: string;
  lastMessageAt: Date;
  direction: 'INBOUND' | 'OUTBOUND';
  messageCount: number;
  unreadCount: number;
  assigneeId?: string;
  status: WhatsappConversationStatus;
  lastInboundAt?: Date;
  windowExpiresAt?: Date;
  canReply: boolean;
  replyBlockedReason?: string;
  phoneNumberId?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  awaitingReplyCount?: number;
}

export interface WhatsappFlowNodeDefinition {
  type: string;
  label: string;
  configSchema: Record<string, string>;
}

const DEFAULT_SLA_MS = 15 * 60 * 1000;

@Injectable()
export class WhatsappService {
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
  ) {
    this.verifyToken =
      this.configService.get('META_WEBHOOK_VERIFY_TOKEN') || env.whatsapp.verifyToken || '';
  }

  getVerifyToken(): string {
    return this.verifyToken;
  }

  /** Called only after signature verification and account-derived tenant routing. */
  async processIncomingMessage(tenantId: string, payload: Record<string, unknown>): Promise<void> {
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
        await this.processDeliveryStatuses(tenantId, phoneNumberId, statuses);
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
          const providerTime = new Date(Number(message.timestamp) * 1000);
          if (
            !Number.isFinite(providerTime.getTime()) ||
            providerTime.getTime() > Date.now() + 300000
          ) {
            throw new BadRequestException('Invalid provider message timestamp');
          }
          if (this.isOptOut(messageText)) await this.consent.suppress(tenantId, senderPhone);
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
          if (!stored || stored.workflowDispatched || this.isOptOut(messageText)) continue;
          const contact = await this.findOrCreateContactByPhone(tenantId, senderPhone);
          if (contact.customFields?.whatsappStatus === 'RESOLVED') {
            contact.customFields = { ...contact.customFields, whatsappStatus: 'OPEN' };
            await this.contactRepository.save(contact);
          }
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
          });
          await this.messages.update({ tenantId, id: stored.id }, { workflowDispatched: true });
        }
      }
    }
  }

  isOptOut(text: string): boolean {
    const configured =
      this.configService.get<string>('WHATSAPP_OPT_OUT_KEYWORDS') ??
      'STOP,UNSUBSCRIBE,CANCEL,END,QUIT';
    return configured
      .split(',')
      .some((keyword) => keyword.trim().toLocaleUpperCase() === text.trim().toLocaleUpperCase());
  }

  private async processDeliveryStatuses(
    tenantId: string,
    phoneNumberId: string,
    statuses: Array<Record<string, unknown>>,
  ): Promise<void> {
    const rank: Record<string, number> = { SUBMITTED: 0, SENT: 1, DELIVERED: 2, READ: 3 };
    for (const entry of statuses) {
      const messageSid = String(entry.id ?? '');
      const status = String(entry.status ?? '').toUpperCase();
      if (!messageSid || !['SENT', 'DELIVERED', 'READ', 'FAILED'].includes(status)) continue;
      const changed = await this.messages.manager.transaction(async (manager) => {
        const row = await manager.getRepository(WhatsAppMessage).findOne({
          where: { tenantId, phoneNumberId, messageSid, direction: 'OUTBOUND' },
          lock: { mode: 'pessimistic_write' },
        });
        if (!row) return null;
        // Replays retry event dispatch after a queue failure; workflow event IDs suppress duplicate executions.
        if (row.status === status) return row;
        if (
          (status !== 'FAILED' && (rank[row.status] ?? -1) >= rank[status]) ||
          (status === 'FAILED' && ['DELIVERED', 'READ'].includes(row.status))
        )
          return null;
        row.status = status;
        if (status === 'FAILED') {
          const errors = entry.errors as Array<{ code?: number; title?: string }> | undefined;
          row.errorReason =
            errors
              ?.map((error) => `${error.code ?? ''} ${error.title ?? 'Provider rejected message'}`)
              .join('; ') ?? 'Provider delivery failed';
        }
        await manager.save(row);
        return row;
      });
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
      const existing = await repo.findOne({ where: { tenantId, idempotencyKey } });
      if (existing) {
        if (existing.requestHash !== requestHash)
          throw new ConflictException('Idempotency key was used for a different message');
        if (['SUBMITTED', 'SENT', 'DELIVERED', 'READ'].includes(existing.status))
          return { row: existing, send: false };
        if (existing.status === 'FAILED' && existing.retryAllowed) {
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
      if (limit !== undefined && limit >= 0) {
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
      }
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
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          tenantId + ':whatsapp-usage',
        ]);
        await manager.update(
          WhatsAppMessage,
          { tenantId, id: reservation.row.id },
          { messageSid: providerId, status: 'SUBMITTED' },
        );
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
      });
      reservation.row.messageSid = providerId;
      reservation.row.status = 'SUBMITTED';
      this.eventEmitter.emit(EVENT_NAMES.MESSAGE_SENT, {
        tenantId,
        channel: 'whatsapp',
        phone: to,
        messageSid: providerId,
      });
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
      if (definiteRejection && error instanceof WhatsappProviderError && error.retryable)
        throw error;
      throw new BadRequestException(
        definiteRejection
          ? 'WhatsApp rejected the message; check account permissions and template parameters'
          : 'Message acceptance is unknown. Do not retry with a new key until reconciled.',
      );
    }
  }

  async getAnalytics(tenantId: string) {
    const rows = await this.messages
      .createQueryBuilder('m')
      .select('m.direction', 'direction')
      .addSelect('m.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('m.tenantId = :tenantId', { tenantId })
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
      cost: null,
      revenueAttribution: null,
      ...(await this.calculateInboxSLA(tenantId)),
    };
  }

  async listMessages(tenantId: string): Promise<WhatsAppMessage[]> {
    return this.messageRepository.findAll(tenantId, {
      order: { createdAt: 'DESC' },
    });
  }

  async listConversations(tenantId: string): Promise<WhatsappConversationSummary[]> {
    const messages = await this.listMessages(tenantId);
    const conversations = new Map<
      string,
      WhatsappConversationSummary & { inboundSinceReply: number }
    >();
    const contacts = await this.contactRepository.find({ where: { tenantId } });
    const contactByPhone = new Map<string, Contact>();

    const latestInbound = new Map<string, WhatsAppMessage>();
    const reachedReply = new Set<string>();
    for (const message of messages) {
      if (message.direction === 'INBOUND') {
        const key = message.from + ':' + message.phoneNumberId;
        if (!latestInbound.has(key)) latestInbound.set(key, message);
      }
    }
    for (const contact of contacts) {
      if (contact.phone) {
        contactByPhone.set(contact.phone.replace(/\D/g, ''), contact);
      }
      if (contact.mobile) {
        contactByPhone.set(contact.mobile.replace(/\D/g, ''), contact);
      }
    }

    for (const message of messages) {
      const phone = message.direction === 'INBOUND' ? message.from : message.to;
      const existing = conversations.get(phone);
      if (!existing) {
        const contact = contactByPhone.get(phone);
        conversations.set(phone, {
          phone,
          contactName: contact ? `${contact.firstName} ${contact.lastName}`.trim() : undefined,
          lastMessage: message.body,
          lastMessageAt: message.createdAt,
          direction: message.direction,
          messageCount: 1,
          unreadCount: message.direction === 'INBOUND' ? 1 : 0,
          assigneeId: contact?.ownerId,
          status: this.getConversationStatus(contact),
          priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(
            String(contact?.customFields?.whatsappPriority),
          )
            ? (contact?.customFields.whatsappPriority as WhatsappConversationSummary['priority'])
            : 'NORMAL',
          tags: contact?.tags ?? [],
          canReply: false,
          phoneNumberId: message.phoneNumberId,
          inboundSinceReply: message.direction === 'INBOUND' ? 1 : 0,
        });
        if (message.direction === 'OUTBOUND') reachedReply.add(phone);
        continue;
      }

      existing.messageCount += 1;
      if (message.direction === 'OUTBOUND') reachedReply.add(phone);
      if (message.direction === 'INBOUND' && !reachedReply.has(phone))
        existing.inboundSinceReply += 1;
      existing.unreadCount = existing.inboundSinceReply;

      if (message.createdAt > existing.lastMessageAt) {
        existing.lastMessage = message.body;
        existing.lastMessageAt = message.createdAt;
        existing.direction = message.direction;
      }
    }

    const unreadByPhone = new Map<string, number>();
    for (const message of messages) {
      if (message.direction !== 'INBOUND') continue;
      const readAt = Date.parse(
        String(contactByPhone.get(message.from)?.customFields?.whatsappReadAt ?? ''),
      );
      if (!Number.isFinite(readAt) || message.createdAt.getTime() > readAt)
        unreadByPhone.set(message.from, (unreadByPhone.get(message.from) ?? 0) + 1);
    }
    for (const summary of conversations.values()) {
      summary.awaitingReplyCount = summary.status === 'RESOLVED' ? 0 : summary.inboundSinceReply;
      summary.unreadCount = unreadByPhone.get(summary.phone) ?? 0;
      const inbound = latestInbound.get(summary.phone + ':' + summary.phoneNumberId);
      summary.lastInboundAt = inbound?.providerTimestamp;
      summary.windowExpiresAt = inbound?.providerTimestamp
        ? new Date(inbound.providerTimestamp.getTime() + 86400000)
        : undefined;
      const eligibility = await this.consent.getEligibility(tenantId, summary.phone, 'SERVICE');
      summary.canReply =
        eligibility.eligible && (summary.windowExpiresAt?.getTime() ?? 0) > Date.now();
      summary.replyBlockedReason =
        eligibility.reason ??
        (summary.canReply
          ? undefined
          : 'Use an approved template outside the customer-service window');
    }
    return Array.from(conversations.values())
      .map(({ inboundSinceReply: _ignored, ...summary }) => summary)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getConversation(tenantId: string, phone: string): Promise<WhatsAppMessage[]> {
    phone = this.consent.normalizePhone(phone);
    return this.messageRepository.findConversation(tenantId, phone);
  }

  async updateConversation(tenantId: string, input: string, dto: UpdateWhatsappConversationDto) {
    const phone = this.consent.normalizePhone(input);
    const contact = await this.consent.findContact(tenantId, phone);
    if (!contact) throw new NotFoundException('CRM contact for this conversation was not found');
    await this.contactRepository.manager.transaction(async (manager) => {
      const row = await manager
        .getRepository(Contact)
        .findOne({ where: { tenantId, id: contact.id }, lock: { mode: 'pessimistic_write' } });
      if (!row) throw new NotFoundException('Contact was removed');
      if (dto.tags !== undefined)
        row.tags = [...new Set(dto.tags.map((tag) => tag.trim()).filter(Boolean))];
      row.customFields = {
        ...row.customFields,
        ...(dto.status ? { whatsappStatus: dto.status } : {}),
        ...(dto.priority ? { whatsappPriority: dto.priority } : {}),
      };
      await manager.save(row);
    });
    return { phone, ...dto };
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
    const contact = await this.findOrCreateContactByPhone(tenantId, phone);
    contact.ownerId = assigneeId;
    contact.customFields = {
      ...contact.customFields,
      whatsappStatus: 'OPEN',
    };
    await this.contactRepository.save(contact);
    const summaries = await this.listConversations(tenantId);
    const summary = summaries.find((item) => item.phone === phone);
    if (!summary) {
      throw new NotFoundException('Conversation not found');
    }
    return { ...summary, assigneeId, status: 'OPEN' };
  }

  async resolveConversation(tenantId: string, phone: string): Promise<WhatsappConversationSummary> {
    phone = this.consent.normalizePhone(phone);
    const contact = await this.findOrCreateContactByPhone(tenantId, phone);
    if (contact) {
      contact.customFields = {
        ...contact.customFields,
        whatsappStatus: 'RESOLVED',
        whatsappReadAt: new Date().toISOString(),
      };
      await this.contactRepository.save(contact);
    }

    const summaries = await this.listConversations(tenantId);
    const summary = summaries.find((item) => item.phone === phone);
    if (!summary) {
      throw new NotFoundException('Conversation not found');
    }
    return { ...summary, status: 'RESOLVED', unreadCount: 0 };
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

    const media = message[type] as { id?: string; link?: string } | undefined;
    const mediaId = media?.id ?? media?.link;
    return mediaId ? [String(mediaId)] : [];
  }

  private getConversationStatus(contact?: Contact): WhatsappConversationStatus {
    const status = contact?.customFields?.whatsappStatus;
    return status === 'RESOLVED' ? 'RESOLVED' : 'OPEN';
  }

  private async findContactByPhone(tenantId: string, phone: string): Promise<Contact | null> {
    return this.consent.findContact(tenantId, this.consent.normalizePhone(phone));
  }

  private async findOrCreateContactByPhone(tenantId: string, phone: string): Promise<Contact> {
    const existing = await this.findContactByPhone(tenantId, phone);
    if (existing) {
      return existing;
    }

    return this.contactRepository.save(
      this.contactRepository.create({
        tenantId,
        firstName: phone,
        lastName: '',
        email: `whatsapp-${phone.replace(/\D/g, '')}@placeholder.local`,
        mobile: phone,
        customFields: { whatsappStatus: 'OPEN' },
      }),
    );
  }

  async calculateInboxSLA(
    tenantId: string,
  ): Promise<{ averageResponseTimeMs: number; breached: number }> {
    const slaThresholdMs = Number(this.configService.get('WHATSAPP_SLA_MS')) || DEFAULT_SLA_MS;
    const messages = await this.messageRepository.findAll(tenantId, {
      order: { createdAt: 'ASC' },
    });

    const responseTimesMs: number[] = [];
    const lastInboundByPhone = new Map<string, Date>();

    for (const message of messages) {
      const phone = message.direction === 'INBOUND' ? message.from : message.to;

      if (message.direction === 'INBOUND') {
        lastInboundByPhone.set(phone, message.createdAt);
        continue;
      }

      const inboundAt = lastInboundByPhone.get(phone);
      if (!inboundAt) {
        continue;
      }

      const responseMs = message.createdAt.getTime() - inboundAt.getTime();
      if (responseMs >= 0) {
        responseTimesMs.push(responseMs);
        lastInboundByPhone.delete(phone);
      }
    }

    const breached = responseTimesMs.filter((ms) => ms > slaThresholdMs).length;
    const averageResponseTimeMs =
      responseTimesMs.length > 0
        ? Math.round(responseTimesMs.reduce((sum, ms) => sum + ms, 0) / responseTimesMs.length)
        : 0;

    return { averageResponseTimeMs, breached };
  }

  getFlowBuilderNodes(_tenantId: string): WhatsappFlowNodeDefinition[] {
    return [
      { type: 'TRIGGER_KEYWORD', label: 'Keyword Trigger', configSchema: { keyword: 'string' } },
      { type: 'SEND_MESSAGE', label: 'Send Message', configSchema: { text: 'string' } },
      { type: 'SEND_TEMPLATE', label: 'Send Template', configSchema: { templateId: 'uuid' } },
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
