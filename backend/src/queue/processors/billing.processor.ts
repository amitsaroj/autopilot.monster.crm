import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

export interface BillingJobPayload {
  tenantId: string;
  action: string;
  payload?: Record<string, unknown>;
}

@Processor(QUEUE_NAMES.BILLING)
export class BillingQueueProcessor {
  private readonly logger = new Logger(BillingQueueProcessor.name);

  @Process(JOB_NAMES.PROCESS_BILLING)
  async handleProcessBilling(job: Job<BillingJobPayload>): Promise<{ status: string }> {
    const { tenantId, action } = job.data;
    this.logger.log(`Processing billing job ${job.id} (${action}) for tenant ${tenantId}`);

    // Stripe webhook side-effects are handled synchronously today; queue is for async fan-out.
    return { status: 'ACKNOWLEDGED' };
  }
}
