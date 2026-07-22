import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import type { AnalyticsJobPayload } from '../../queue/processors/analytics.processor';

@Injectable()
export class AnalyticsQueueService {
  private readonly logger = new Logger(AnalyticsQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.ANALYTICS)
    private readonly analyticsQueue: Queue<AnalyticsJobPayload>,
  ) {}

  async trackEvent(
    tenantId: string,
    event: string,
    properties?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.analyticsQueue.add(JOB_NAMES.TRACK_EVENT, {
        tenantId,
        event,
        properties,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to enqueue analytics event ${event}: ${message}`);
    }
  }
}
