import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DealStatus } from '../../database/entities/deal.entity';
import type { Contact } from '../../database/entities/contact.entity';
import type { Deal } from '../../database/entities/deal.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { WorkflowService } from './workflow.service';
import { WorkflowRepository } from './workflow.repository';
import { extractWhatsappFlowKeyword, messageMatchesKeyword } from './whatsapp-flow-matcher.util';

@Injectable()
export class WorkflowEventListener {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowRepo: WorkflowRepository,
  ) {}

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

  @OnEvent(EVENT_NAMES.MESSAGE_RECEIVED)
  async handleMessageReceived(payload: {
    tenantId: string;
    channel?: string;
    phone?: string;
    body?: string;
    messageSid?: string;
    contactId?: string;
  }): Promise<void> {
    if (payload.channel !== 'whatsapp' || !payload.tenantId) {
      return;
    }

    const body = String(payload.body ?? '');
    const eventPayload: Record<string, unknown> = {
      phone: payload.phone,
      body,
      message: body,
      text: body,
      messageSid: payload.messageSid,
      contactId: payload.contactId,
      channel: 'whatsapp',
    };

    await this.trigger('WHATSAPP_MESSAGE_RECEIVED', payload.tenantId, eventPayload);
    try {
      await this.triggerWhatsappKeywordFlows(payload.tenantId, body, eventPayload);
    } catch (error) {
      this.logger.error('Failed to execute WhatsApp keyword flows', error);
    }
  }

  private async triggerWhatsappKeywordFlows(
    tenantId: string,
    messageBody: string,
    eventPayload: Record<string, unknown>,
  ): Promise<void> {
    const flows = await this.workflowRepo.findPublishedByType(tenantId, 'whatsapp');
    if (!flows.length) {
      return;
    }

    let matched = 0;
    for (const flow of flows) {
      const definition =
        flow.definition && typeof flow.definition === 'object'
          ? (flow.definition as Record<string, unknown>)
          : {};
      const keyword = extractWhatsappFlowKeyword(definition);
      if (!keyword || !messageMatchesKeyword(messageBody, keyword)) {
        continue;
      }

      await this.workflowService.triggerWorkflow(
        tenantId,
        'WHATSAPP_KEYWORD',
        { ...eventPayload, keyword, flowId: flow.id },
        flow.id,
      );
      matched += 1;
    }

    if (matched > 0) {
      this.logger.log(`Triggered ${matched} WhatsApp keyword flow(s) for tenant ${tenantId}`);
    }
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
