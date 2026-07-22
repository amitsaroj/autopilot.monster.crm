import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { EmailService } from '../../shared/email/email.service';

export interface EmailJobPayload {
  to: string;
  subject: string;
  html: string;
  tenantId?: string;
}

@Processor(QUEUE_NAMES.EMAIL)
export class EmailQueueProcessor {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process(JOB_NAMES.SEND_EMAIL)
  async handleSendEmail(job: Job<EmailJobPayload>): Promise<{ sent: boolean }> {
    const { to, subject, html } = job.data;
    this.logger.log(`Processing email job ${job.id} to ${to}`);

    const sent = await this.emailService.sendEmail(to, subject, html);
    if (!sent) {
      throw new Error(`Failed to send email to ${to}`);
    }

    return { sent: true };
  }
}
