import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { TwilioService } from '../../modules/voice/twilio.service';

export interface SmsJobPayload {
  tenantId: string;
  to: string;
  body: string;
}

@Processor(QUEUE_NAMES.SMS)
export class SmsQueueProcessor {
  private readonly logger = new Logger(SmsQueueProcessor.name);

  constructor(private readonly twilioService: TwilioService) {}

  @Process(JOB_NAMES.SEND_SMS)
  async handleSendSms(job: Job<SmsJobPayload>): Promise<{ status: string }> {
    const { tenantId, to, body } = job.data;
    this.logger.log(`Processing SMS job ${job.id} to ${to} for tenant ${tenantId}`);

    await this.twilioService.sendSms(tenantId, to, body);
    return { status: 'SENT' };
  }
}
