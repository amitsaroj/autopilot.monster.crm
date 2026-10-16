import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WEBHOOK_JOB, WEBHOOK_QUEUE, WebhookJobData, WebhookService } from './webhook.service';

@Processor(WEBHOOK_QUEUE)
export class WebhookDeliveryProcessor {
  constructor(private readonly webhooks: WebhookService) {}

  @Process({ name: WEBHOOK_JOB, concurrency: 5 })
  async deliver(job: Job<WebhookJobData>): Promise<void> {
    await this.webhooks.deliver(
      job.data.tenantId,
      job.data.deliveryId,
      Math.max(0, (job.opts.attempts ?? 1) - job.attemptsMade - 1),
    );
  }
}
