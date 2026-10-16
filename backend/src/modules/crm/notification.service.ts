import { Injectable, Logger } from '@nestjs/common';

import { WhatsappService } from '../whatsapp/whatsapp.service';

/** Keeps only the last 4 digits so logs never carry a full phone number. */
export function redactPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 4 ? `***${digits.slice(-4)}` : '***';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Sends a post-call follow-up via the tenant's own connected WhatsApp account.
   * Fails closed (returns false) when the tenant has no single connected account;
   * never falls back to a platform phone number.
   */
  async sendPostCallFollowUp(
    tenantId: string,
    to: string,
    leadName: string,
    summary: string,
  ): Promise<boolean> {
    const recipient = redactPhone(to);
    const message = `Hi ${leadName}, thank you for speaking with our AI assistant today! \n\nSummary of our call: ${summary} \n\nWe will reach out soon with next steps!`;

    try {
      await this.whatsappService.sendTextMessage(tenantId, to, message);
      this.logger.log(`Sent WhatsApp follow-up to ${recipient} for tenant ${tenantId}`);
      return true;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `WhatsApp follow-up to ${recipient} not sent for tenant ${tenantId}: ${reason}`,
      );
      return false;
    }
  }
}
