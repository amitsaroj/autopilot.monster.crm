import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { WhatsappService } from './whatsapp.service';
export interface WhatsappWebhookJob {
  tenantId: string;
  payload: Record<string, unknown>;
}
@Processor(QUEUE_NAMES.WHATSAPP)
export class WhatsappWebhookProcessor {
  constructor(private readonly whatsapp: WhatsappService) {}
  @Process({ name: 'webhook-event', concurrency: 4 })
  process(job: Job<WhatsappWebhookJob>): Promise<void> {
    return this.whatsapp.processIncomingMessage(job.data.tenantId, job.data.payload);
  }
}
