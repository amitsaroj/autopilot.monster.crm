import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DealStatus } from '../../database/entities/deal.entity';
import type { Contact } from '../../database/entities/contact.entity';
import type { Deal } from '../../database/entities/deal.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { WorkflowService } from './workflow.service';

@Injectable()
export class WorkflowEventListener {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(private readonly workflowService: WorkflowService) {}

  @OnEvent(EVENT_NAMES.CONTACT_CREATED)
  async handleContactCreated(payload: { contact: Contact; tenantId: string }): Promise<void> {
    await this.trigger('CONTACT_CREATED', payload.tenantId, {
      contactId: payload.contact.id,
      contact: payload.contact,
    });
  }

  @OnEvent(EVENT_NAMES.CONTACT_UPDATED)
  async handleContactUpdated(payload: { contact: Contact; tenantId: string }): Promise<void> {
    await this.trigger('CONTACT_UPDATED', payload.tenantId, {
      contactId: payload.contact.id,
      contact: payload.contact,
    });
  }

  @OnEvent(EVENT_NAMES.DEAL_CREATED)
  async handleDealCreated(payload: { deal: Deal; tenantId: string }): Promise<void> {
    await this.trigger('DEAL_CREATED', payload.tenantId, {
      dealId: payload.deal.id,
      deal: payload.deal,
    });
  }

  @OnEvent(EVENT_NAMES.DEAL_STAGE_CHANGED)
  async handleDealStageChanged(payload: {
    deal: Deal;
    oldStageId: string;
    newStageId: string;
    tenantId: string;
    changedBy?: string;
  }): Promise<void> {
    const eventPayload = {
      dealId: payload.deal.id,
      deal: payload.deal,
      oldStageId: payload.oldStageId,
      newStageId: payload.newStageId,
      changedBy: payload.changedBy,
    };

    await this.trigger('DEAL_STAGE_CHANGED', payload.tenantId, eventPayload);

    if (payload.deal.status === DealStatus.WON) {
      await this.trigger('DEAL_WON', payload.tenantId, eventPayload);
    } else if (payload.deal.status === DealStatus.LOST) {
      await this.trigger('DEAL_LOST', payload.tenantId, eventPayload);
    }
  }

  @OnEvent(EVENT_NAMES.CALL_ENDED)
  async handleCallEnded(payload: {
    call: { id: string; to?: string; from?: string; status?: string; direction?: string };
    tenantId: string;
  }): Promise<void> {
    await this.trigger('CALL_COMPLETED', payload.tenantId, {
      callId: payload.call.id,
      call: payload.call,
    });
  }

  private async trigger(
    eventName: string,
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      const result = await this.workflowService.triggerWorkflow(tenantId, eventName, payload);
      if (result.triggered > 0) {
        this.logger.log(`Triggered ${result.triggered} workflow(s) for ${eventName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to trigger workflow for ${eventName}`, error);
    }
  }
}
