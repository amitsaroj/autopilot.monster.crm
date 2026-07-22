import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

export interface AnalyticsJobPayload {
  tenantId: string;
  event: string;
  properties?: Record<string, unknown>;
}

const EVENT_METRIC_MAP: Record<string, string> = {
  'deal.created': 'deals_created',
  'deal.won': 'deals_won',
  'deal.lost': 'deals_lost',
  'deal.stage.changed': 'deals_stage_changed',
  'call.ended': 'calls_ended',
  'contact.created': 'contacts_created',
};

@Processor(QUEUE_NAMES.ANALYTICS)
export class AnalyticsQueueProcessor {
  private readonly logger = new Logger(AnalyticsQueueProcessor.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Process(JOB_NAMES.TRACK_EVENT)
  async handleTrackEvent(job: Job<AnalyticsJobPayload>): Promise<{ status: string }> {
    const { tenantId, event, properties } = job.data;
    this.logger.log(`Processing analytics job ${job.id} (${event}) for tenant ${tenantId}`);

    const metricName = EVENT_METRIC_MAP[event] ?? event.replace(/\./g, '_');
    const value = typeof properties?.value === 'number' ? properties.value : 1;

    await this.analyticsService.captureMetric(tenantId, metricName, value, 'DAILY');
    return { status: 'RECORDED' };
  }
}
