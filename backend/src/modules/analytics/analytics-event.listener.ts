import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DealStatus } from '../../database/entities/deal.entity';
import type { Deal } from '../../database/entities/deal.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { AnalyticsQueueService } from './analytics-queue.service';

@Injectable()
export class AnalyticsEventListener {
  constructor(private readonly analyticsQueue: AnalyticsQueueService) {}

  @OnEvent(EVENT_NAMES.DEAL_CREATED, { async: true })
  async onDealCreated(payload: { deal: Deal; tenantId: string }): Promise<void> {
    await this.analyticsQueue.trackEvent(payload.tenantId, 'deal.created', {
      dealId: payload.deal.id,
      value: Number(payload.deal.value ?? 0),
    });
  }

  @OnEvent(EVENT_NAMES.DEAL_STAGE_CHANGED, { async: true })
  async onDealStageChanged(payload: { deal: Deal; tenantId: string }): Promise<void> {
    let event = 'deal.stage.changed';
    if (payload.deal.status === DealStatus.WON) {
      event = 'deal.won';
    } else if (payload.deal.status === DealStatus.LOST) {
      event = 'deal.lost';
    }

    await this.analyticsQueue.trackEvent(payload.tenantId, event, {
      dealId: payload.deal.id,
      status: payload.deal.status,
      value: Number(payload.deal.value ?? 0),
    });
  }

  @OnEvent(EVENT_NAMES.CALL_ENDED, { async: true })
  async onCallEnded(payload: {
    tenantId: string;
    call: { id: string; status?: string; direction?: string };
  }): Promise<void> {
    await this.analyticsQueue.trackEvent(payload.tenantId, 'call.ended', {
      callId: payload.call.id,
      status: payload.call.status,
      direction: payload.call.direction,
    });
  }

  @OnEvent(EVENT_NAMES.CONTACT_CREATED, { async: true })
  async onContactCreated(payload: { tenantId: string; contact: { id: string } }): Promise<void> {
    await this.analyticsQueue.trackEvent(payload.tenantId, 'contact.created', {
      contactId: payload.contact.id,
    });
  }
}
