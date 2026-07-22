import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { isAxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { Contact } from '../../database/entities/contact.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';

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
}

export interface WhatsappFlowNodeDefinition {
  type: string;
  label: string;
  configSchema: Record<string, string>;
}

const DEFAULT_SLA_MS = 15 * 60 * 1000;

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly verifyToken: string;
  private readonly isProduction: boolean;

  constructor(
    private configService: ConfigService,
    private readonly messageRepository: WhatsappMessageRepository,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly configOrchestrator: ConfigOrchestratorService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN') || '';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getVerifyToken(): string {
    return this.verifyToken;
  }

  async processIncomingMessage(tenantId: string, payload: Record<string, unknown>) {
    this.logger.log('Processing incoming WhatsApp payload');

    try {
      const entry = (payload.entry as Array<Record<string, unknown>> | undefined)?.[0];
      const changes = (entry?.changes as Array<Record<string, unknown>> | undefined)?.[0];
      const value = changes?.value as Record<string, unknown> | undefined;
      if (!value) {
        return;
      }

      const statuses = value.statuses as Array<Record<string, unknown>> | undefined;
      if (statuses?.length) {
        await this.processDeliveryStatuses(statuses);
        return;
      }

      const messages = value.messages as Array<Record<string, unknown>> | undefined;
      const message = messages?.[0];

      if (!message) {
        return;
      }

      const senderPhone = String(message.from ?? '');
      const messageType = String(message.type ?? 'text');
      const messageText =
        (message.text as { body?: string } | undefined)?.body ??
        this.describeMediaMessage(messageType, message);
      const messageSid = String(message.id ?? randomUUID());
      const mediaUrls = this.extractMediaUrls(messageType, message);

      await this.messageRepository.create(tenantId, {
        messageSid,
        from: senderPhone,
        to: String(
          (value?.metadata as { display_phone_number?: string } | undefined)
            ?.display_phone_number ?? '',
        ),
        body: messageText,
        direction: 'INBOUND',
        status: 'DELIVERED',
        mediaUrls,
      });

      const contact = senderPhone ? await this.findContactByPhone(tenantId, senderPhone) : null;

      this.eventEmitter.emit(EVENT_NAMES.MESSAGE_RECEIVED, {
        tenantId,
        channel: 'whatsapp',
        phone: senderPhone,
        body: messageText,
        messageSid,
        contactId: contact?.id,
      });
    } catch (err) {
      this.logger.error('Failed to parse Meta webhook payload', err);
    }
  }

  private async processDeliveryStatuses(statuses: Array<Record<string, unknown>>): Promise<void> {
    for (const statusEntry of statuses) {
      const messageSid = String(statusEntry.id ?? '');
      const status = String(statusEntry.status ?? '').toUpperCase();
      if (!messageSid || !status) {
        continue;
      }
      await this.messageRepository.updateStatusByMessageSid(messageSid, status);
    }
  }

  async sendTextMessage(
    tenantId: string,
    to: string,
    text: string,
    wabaId?: string,
  ): Promise<WhatsAppMessage> {
    const credentials = await this.getTenantCredentials(tenantId, wabaId);

    if (!credentials.accessToken || !credentials.phoneNumberId) {
      throw new BadRequestException(
        `WhatsApp credentials are not fully configured for tenant ${tenantId}`,
      );
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${credentials.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      const detail = isAxiosError(error)
        ? String(error.response?.data ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Meta API request failed';
      this.logger.error(`WhatsApp send failed for tenant ${tenantId}: ${detail}`);
      throw new BadRequestException(`WhatsApp send failed: ${detail}`);
    }

    return this.messageRepository.create(tenantId, {
      messageSid: `local_${randomUUID()}`,
      from: credentials.phoneNumberId,
      to,
      body: text,
      direction: 'OUTBOUND',
      status: 'SENT',
    });
  }

  async sendTemplateMessage(
    tenantId: string,
    to: string,
    templateName: string,
    language: string,
    components: unknown[] = [],
    wabaId?: string,
  ): Promise<WhatsAppMessage> {
    const credentials = await this.getTenantCredentials(tenantId, wabaId);
    if (!credentials.accessToken || !credentials.phoneNumberId) {
      throw new BadRequestException(
        `WhatsApp credentials are not fully configured for tenant ${tenantId}`,
      );
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${credentials.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      const detail = isAxiosError(error)
        ? String(error.response?.data ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Meta API request failed';
      this.logger.error(`WhatsApp template send failed for tenant ${tenantId}: ${detail}`);
      throw new BadRequestException(`WhatsApp template send failed: ${detail}`);
    }

    return this.messageRepository.create(tenantId, {
      messageSid: `local_${randomUUID()}`,
      from: credentials.phoneNumberId,
      to,
      body: `[Template: ${templateName}]`,
      direction: 'OUTBOUND',
      status: 'SENT',
    });
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

    for (const contact of contacts) {
      if (contact.phone) {
        contactByPhone.set(contact.phone, contact);
      }
      if (contact.mobile) {
        contactByPhone.set(contact.mobile, contact);
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
          inboundSinceReply: message.direction === 'INBOUND' ? 1 : 0,
        });
        continue;
      }

      existing.messageCount += 1;
      if (message.direction === 'INBOUND') {
        existing.inboundSinceReply += 1;
      } else {
        existing.inboundSinceReply = 0;
      }
      existing.unreadCount = existing.inboundSinceReply;

      if (message.createdAt > existing.lastMessageAt) {
        existing.lastMessage = message.body;
        existing.lastMessageAt = message.createdAt;
        existing.direction = message.direction;
      }
    }

    return Array.from(conversations.values())
      .map(({ inboundSinceReply: _ignored, ...summary }) => summary)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getConversation(tenantId: string, phone: string): Promise<WhatsAppMessage[]> {
    return this.messageRepository.findConversation(tenantId, phone);
  }

  async assignConversation(
    tenantId: string,
    phone: string,
    assigneeId: string,
  ): Promise<WhatsappConversationSummary> {
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
    const contact = await this.findContactByPhone(tenantId, phone);
    if (contact) {
      contact.customFields = {
        ...contact.customFields,
        whatsappStatus: 'RESOLVED',
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
    return this.contactRepository.findOne({
      where: [
        { tenantId, phone },
        { tenantId, mobile: phone },
      ],
    });
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
        type: 'AWAIT_RESPONSE',
        label: 'Await Response',
        configSchema: { timeoutMinutes: 'number' },
      },
      { type: 'ASSIGN_AGENT', label: 'Assign Agent', configSchema: { assigneeId: 'uuid' } },
      { type: 'RESOLVE', label: 'Resolve Conversation', configSchema: {} },
    ];
  }

  private async getTenantCredentials(
    tenantId: string,
    requestedPhoneNumberId?: string,
  ): Promise<{ accessToken: string; phoneNumberId: string; businessAccountId: string }> {
    const accessToken = String(
      (await this.configOrchestrator.get(tenantId, 'whatsapp_access_token')) ||
        this.configService.get<string>('WHATSAPP_TOKEN') ||
        '',
    ).trim();
    const configuredPhoneNumberId = String(
      (await this.configOrchestrator.get(tenantId, 'whatsapp_phone_number_id')) ||
        this.configService.get<string>('WHATSAPP_PHONE_ID') ||
        '',
    ).trim();
    const businessAccountId = String(
      (await this.configOrchestrator.get(tenantId, 'whatsapp_business_account_id')) ||
        (await this.configOrchestrator.get(tenantId, 'whatsapp_business_id')) ||
        this.configService.get<string>('WHATSAPP_BUSINESS_ACCOUNT_ID') ||
        '',
    ).trim();

    if (
      requestedPhoneNumberId &&
      configuredPhoneNumberId &&
      requestedPhoneNumberId !== configuredPhoneNumberId
    ) {
      throw new BadRequestException(
        `Requested WhatsApp phone number is not allowed for tenant ${tenantId}`,
      );
    }

    const phoneNumberId = (requestedPhoneNumberId || configuredPhoneNumberId || '').trim();
    if (this.isProduction && (!accessToken || !phoneNumberId || !businessAccountId)) {
      this.logger.error(
        `Missing WhatsApp production credentials for tenant ${tenantId} (token/phone/businessAccount)`,
      );
    }

    return { accessToken, phoneNumberId, businessAccountId };
  }
}
