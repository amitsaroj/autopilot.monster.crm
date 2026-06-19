import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { Contact } from '../../database/entities/contact.entity';

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

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly verifyToken: string;
  private readonly apiToken: string;
  private readonly phoneId: string;

  constructor(
    private configService: ConfigService,
    private readonly messageRepository: WhatsappMessageRepository,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {
    this.verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN') || 'my_secure_token_123';
    this.apiToken = this.configService.get('WHATSAPP_TOKEN') || '';
    this.phoneId = this.configService.get('WHATSAPP_PHONE_ID') || '';
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
      const messages = value?.messages as Array<Record<string, unknown>> | undefined;
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
        to: String((value?.metadata as { display_phone_number?: string } | undefined)?.display_phone_number ?? ''),
        body: messageText,
        direction: 'INBOUND',
        status: 'DELIVERED',
        mediaUrls,
      });
    } catch (err) {
      this.logger.error('Failed to parse Meta webhook payload', err);
    }
  }

  async sendTextMessage(tenantId: string, to: string, text: string, wabaId?: string): Promise<WhatsAppMessage> {
    const phoneId = wabaId || this.phoneId;

    if (this.apiToken && phoneId) {
      await axios.post(
        `https://graph.facebook.com/v19.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } else {
      this.logger.warn(`WhatsApp credentials missing for tenant ${tenantId}; storing outbound message only`);
    }

    return this.messageRepository.create(tenantId, {
      messageSid: `local_${randomUUID()}`,
      from: phoneId || 'system',
      to,
      body: text,
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
    const conversations = new Map<string, WhatsappConversationSummary & { inboundSinceReply: number }>();
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

  async assignConversation(tenantId: string, phone: string, assigneeId: string): Promise<WhatsappConversationSummary> {
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
}
