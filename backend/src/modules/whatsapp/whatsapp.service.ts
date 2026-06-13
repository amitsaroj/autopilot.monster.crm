import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly verifyToken: string;

  constructor(
    private configService: ConfigService,
    private configOrchestrator: ConfigOrchestratorService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(WhatsAppMessage)
    private readonly messageRepo: Repository<WhatsAppMessage>,
  ) {
    this.verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN') || 'my_secure_token_123';
  }

  getVerifyToken(): string {
    return this.verifyToken;
  }

  async processIncomingMessage(payload: any) {
    this.logger.log('Processing incoming WhatsApp Payload');

    try {
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) return;

      const senderPhone = message.from;
      const messageText = message.text?.body || '[Media/Unsupported]';
      const wabaId = value.metadata.phone_number_id;
      const tenantId = await this.resolveTenantByWabaId(wabaId);

      this.logger.log(`Received message from ${senderPhone} on WABA ${wabaId}: ${messageText}`);

      // Save to Database
      const savedMsg = this.messageRepo.create({
        tenantId,
        messageSid: message.id,
        from: senderPhone,
        to: value.metadata.display_phone_number,
        body: messageText,
        direction: 'INBOUND',
        status: 'RECEIVED',
      });
      await this.messageRepo.save(savedMsg);

      // Publish to internal EventBus
      this.eventEmitter.emit('whatsapp.message.received', {
        tenantId,
        senderPhone,
        text: messageText,
        wabaId,
        messageId: message.id,
        type: message.type,
        timestamp: message.timestamp,
      });
    } catch (err) {
      this.logger.error('Failed to parse Meta webhook payload', err);
    }
  }

  async sendTextMessage(to: string, text: string, wabaId: string, tenantId?: string) {
    this.logger.log(`Sending message to ${to} via WABA ${wabaId}`);
    
    let token = this.configService.get('META_ACCESS_TOKEN');
    if (tenantId) {
      const tenantToken = await this.configOrchestrator.get(tenantId, 'whatsapp_access_token');
      if (tenantToken) token = tenantToken;
    }

    if (!token || !wabaId || wabaId === 'WABA_ID') {
      this.logger.warn('META_ACCESS_TOKEN or wabaId not configured — skipping actual send.');
      return { success: false, reason: 'not_configured' };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v17.0/${wabaId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      });
      
      const data = await res.json() as { messages?: any[]; error?: any };
      
      if (!res.ok) {
        this.logger.error('Meta API error', JSON.stringify(data));
        return { success: false, error: data };
      }

      const messageId = data.messages?.[0]?.id;

      // Save to Database
      if (tenantId) {
        const savedMsg = this.messageRepo.create({
          tenantId,
          messageSid: messageId,
          from: wabaId, // simplified
          to,
          body: text,
          direction: 'OUTBOUND',
          status: 'SENT',
        });
        await this.messageRepo.save(savedMsg);
      }

      return { success: true, messageId };
    } catch (err: any) {
      this.logger.error('Failed to send WhatsApp message', err.message);
      return { success: false, error: err.message };
    }
  }

  async getMessages(tenantId: string) {
    return this.messageRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getConversations(tenantId: string) {
    // Group by contact phone number (simplified logic)
    // In production, use a dedicated Conversation entity for performance
    const messages = await this.messageRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    const conversations = new Map<string, any>();
    for (const msg of messages) {
      const contact = msg.direction === 'INBOUND' ? msg.from : msg.to;
      if (!conversations.has(contact)) {
        conversations.set(contact, {
          contact,
          lastMessage: msg.body,
          timestamp: msg.createdAt,
          direction: msg.direction,
          status: msg.status,
        });
      }
    }

    return Array.from(conversations.values());
  }

  async getTemplates(tenantId: string) {
    // In production, this would hit Meta's /message_templates endpoint
    // For now, return a friendly mock that simulates real Meta templates
    this.logger.debug(`Fetching templates for tenant ${tenantId}`);
    return [
      { name: 'welcome_message', language: 'en_US', category: 'UTILITY', components: [] },
      { name: 'appointment_reminder', language: 'en_US', category: 'MARKETING', components: [] },
    ];
  }

  private async resolveTenantByWabaId(wabaId: string): Promise<string> {
    const tenantId = await this.configOrchestrator.findTenantByConfig('whatsapp_phone_number_id', wabaId);
    if (!tenantId) {
      this.logger.warn(`No tenant found for WABA ID: ${wabaId}`);
      return 'default-tenant';
    }
    return tenantId;
  }

  async calculateInboxSLA(tenantId: string): Promise<{ averageResponseTimeMs: number; breached: number }> {
    this.logger.log(`[STUB] Calculating shared inbox SLA for tenant ${tenantId}`);
    return {
      averageResponseTimeMs: 120000, // 2 minutes
      breached: 5
    };
  }

  async getFlowBuilderNodes(tenantId: string): Promise<any[]> {
    this.logger.log(`[STUB] Fetching flow builder nodes for tenant ${tenantId}`);
    return [
      { id: 'node_1', type: 'TRIGGER_KEYWORD', config: { keyword: 'START' } },
      { id: 'node_2', type: 'SEND_TEMPLATE', config: { templateId: 'welcome_message' } },
      { id: 'node_3', type: 'AWAIT_RESPONSE', config: { timeoutMinutes: 10 } }
    ];
  }
}
