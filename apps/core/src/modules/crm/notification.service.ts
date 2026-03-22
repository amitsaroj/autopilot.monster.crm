import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private whatsappService: WhatsappService,
    private configService: ConfigService,
  ) {}

  /**
   * Sends a post-call follow-up message via WhatsApp.
   */
  async sendPostCallFollowUp(to: string, leadName: string, summary: string) {
    this.logger.log(`Sending WhatsApp follow-up to ${leadName} (${to})`);
    
    const wabaId = this.configService.get('META_PHONE_NUMBER_ID') || 'mock_waba_id';
    const message = `Hi ${leadName}, thank you for speaking with our AI assistant today! \n\nSummary of our call: ${summary} \n\nWe will reach out soon with next steps!`;

    try {
      await this.whatsappService.sendTextMessage(to, message, wabaId);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send follow-up to ${to}`, err);
      return false;
    }
  }
}
