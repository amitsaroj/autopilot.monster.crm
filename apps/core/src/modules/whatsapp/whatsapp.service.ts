import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly verifyToken: string;

  constructor(private configService: ConfigService) {
    this.verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN') || 'my_secure_token_123';
  }

  getVerifyToken(): string {
    return this.verifyToken;
  }

  async processIncomingMessage(payload: any) {
    this.logger.log('Processing incoming WhatsApp Payload');

    // 1. Extract message details from the deeply nested Meta payload
    try {
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) return; // Status updates (read/delivered) also hit here, skip processing them as new messages

      const senderPhone = message.from;
      const messageText = message.text?.body || '[Media/Unsupported]';
      const wabaId = value.metadata.phone_number_id;

      this.logger.log(`Received message from ${senderPhone} on WABA ${wabaId}: ${messageText}`);

      // 2. Publish to internal BullMQ / EventBus
      // e.g. this.eventBus.emit('whatsapp.message.received', { senderPhone, text: messageText });
    } catch (err) {
      this.logger.error('Failed to parse Meta webhook payload', err);
    }
  }

  async sendTextMessage(to: string, _text: string, wabaId: string) {
    this.logger.log(`Sending message to ${to} via ${wabaId}`);
    // Meta Cloud API Fetch call to /v17.0/${wabaId}/messages
    return true;
  }
}
