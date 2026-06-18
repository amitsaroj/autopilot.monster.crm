import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';

import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';

export interface WhatsappConversationSummary {
  phone: string;
  lastMessage: string;
  lastMessageAt: Date;
  direction: 'INBOUND' | 'OUTBOUND';
  messageCount: number;
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
      const messageText = (message.text as { body?: string } | undefined)?.body ?? '[Media/Unsupported]';
      const messageSid = String(message.id ?? randomUUID());

      await this.messageRepository.create(tenantId, {
        messageSid,
        from: senderPhone,
        to: String((value?.metadata as { display_phone_number?: string } | undefined)?.display_phone_number ?? ''),
        body: messageText,
        direction: 'INBOUND',
        status: 'DELIVERED',
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
    const conversations = new Map<string, WhatsappConversationSummary>();

    for (const message of messages) {
      const phone = message.direction === 'INBOUND' ? message.from : message.to;
      const existing = conversations.get(phone);
      if (!existing) {
        conversations.set(phone, {
          phone,
          lastMessage: message.body,
          lastMessageAt: message.createdAt,
          direction: message.direction,
          messageCount: 1,
        });
        continue;
      }

      existing.messageCount += 1;
      if (message.createdAt > existing.lastMessageAt) {
        existing.lastMessage = message.body;
        existing.lastMessageAt = message.createdAt;
        existing.direction = message.direction;
      }
    }

    return Array.from(conversations.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
    );
  }

  async getConversation(tenantId: string, phone: string): Promise<WhatsAppMessage[]> {
    return this.messageRepository.findConversation(tenantId, phone);
  }
}
