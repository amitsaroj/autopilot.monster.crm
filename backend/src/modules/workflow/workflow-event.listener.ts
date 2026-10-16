import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DealStatus } from '../../database/entities/deal.entity';
import type { Contact } from '../../database/entities/contact.entity';
import type { Deal } from '../../database/entities/deal.entity';
import type { Lead } from '../../database/entities/lead.entity';
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

  @OnEvent(EVENT_NAMES.LEAD_CREATED)
  async handleLeadCreated(payload: {
    lead: Lead;
    tenantId: string;
    workflowDepth?: number;
  }): Promise<void> {
    await this.trigger('LEAD_CREATED', payload.tenantId, {
      leadId: payload.lead.id,
      lead: payload.lead,
      // A lead is created once, so its id makes re-delivered events idempotent.
      eventId: `lead.created:${payload.lead.id}`,
      ...(payload.workflowDepth === undefined ? {} : { workflowDepth: payload.workflowDepth }),
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

  @OnEvent(EVENT_NAMES.CALL_DISPOSITIONED)
  async handleCallDispositioned(payload: {
    tenantId: string;
    disposition: string;
    summary: string;
    leadId?: string;
    contactId?: string;
    campaignId?: string;
    recipientId?: string;
  }): Promise<void> {
    // Generic catch-all trigger for anyone who wants every disposition, plus
    // a disposition-specific one (CALL_QUALIFIED, CALL_DO_NOT_CALL, ...) —
    // same pattern as DEAL_STAGE_CHANGED firing alongside DEAL_WON/DEAL_LOST.
    await this.trigger('CALL_DISPOSITIONED', payload.tenantId, payload);
    if (payload.disposition) {
      await this.trigger(`CALL_${payload.disposition}`, payload.tenantId, payload);
    }
  }

  @OnEvent(EVENT_NAMES.MESSAGE_RECEIVED, { suppressErrors: false })
  async handleMessageReceived(payload: {
    tenantId: string;
    channel?: string;
    phone?: string;
    body?: string;
    messageSid?: string;
    contactId?: string;
    eventId?: string;
    phoneNumberId?: string;
    messageType?: string;
    selectionId?: string;
    attribution?: Record<string, string>;
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
      eventId: payload.eventId ?? payload.messageSid,
      phoneNumberId: payload.phoneNumberId,
      messageType: payload.messageType,
      selectionId: payload.selectionId,
      ...(payload.attribution ? { attribution: payload.attribution } : {}),
    };

    await this.workflowService.triggerWorkflow(
      payload.tenantId,
      'WHATSAPP_MESSAGE_RECEIVED',
      eventPayload,
    );
    await this.triggerWhatsappKeywordFlows(payload.tenantId, body, eventPayload);
  }

  @OnEvent(EVENT_NAMES.WHATSAPP_CONVERSATION_RESOLVED, { suppressErrors: false })
  async handleWhatsappConversationResolved(payload: {
    tenantId: string;
    phone: string;
    contactId: string;
    phoneNumberId?: string;
    status: 'RESOLVED';
    eventId: string;
  }): Promise<void> {
    await this.trigger('WHATSAPP_CONVERSATION_RESOLVED', payload.tenantId, payload);
  }

  @OnEvent(EVENT_NAMES.WHATSAPP_CONVERSATION_REOPENED, { suppressErrors: false })
  async handleWhatsappConversationReopened(payload: {
    tenantId: string;
    phone: string;
    contactId: string;
    phoneNumberId?: string;
    status: 'OPEN';
    eventId: string;
  }): Promise<void> {
    await this.trigger('WHATSAPP_CONVERSATION_REOPENED', payload.tenantId, payload);
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_CART_UPDATED, { suppressErrors: false })
  async handleShopifyCartUpdated(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(payload.tenantId, 'SHOPIFY_CART_UPDATED', payload);
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_CHECKOUT_CREATED, { suppressErrors: false })
  async handleShopifyCheckoutCreated(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(
      payload.tenantId,
      'SHOPIFY_CHECKOUT_CREATED',
      payload,
    );
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_CHECKOUT_UPDATED, { suppressErrors: false })
  async handleShopifyCheckoutUpdated(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(
      payload.tenantId,
      'SHOPIFY_CHECKOUT_UPDATED',
      payload,
    );
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_ORDER_CREATED, { suppressErrors: false })
  async handleShopifyOrderCreated(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(payload.tenantId, 'SHOPIFY_ORDER_CREATED', payload);
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_ORDER_PAID, { suppressErrors: false })
  async handleShopifyOrderPaid(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(payload.tenantId, 'SHOPIFY_ORDER_PAID', payload);
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_ORDER_FULFILLED, { suppressErrors: false })
  async handleShopifyOrderFulfilled(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(
      payload.tenantId,
      'SHOPIFY_ORDER_FULFILLED',
      payload,
    );
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_APP_UNINSTALLED, { suppressErrors: false })
  async handleShopifyUninstalled(
    payload: { tenantId: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.workflowService.triggerWorkflow(
      payload.tenantId,
      'SHOPIFY_APP_UNINSTALLED',
      payload,
    );
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

  @OnEvent(EVENT_NAMES.MESSAGE_DELIVERED, { suppressErrors: false })
  async handleDelivered(
    payload: { tenantId: string; channel?: string } & Record<string, unknown>,
  ): Promise<void> {
    if (payload.channel === 'whatsapp')
      await this.workflowService.triggerWorkflow(
        payload.tenantId,
        'WHATSAPP_MESSAGE_DELIVERED',
        payload,
      );
  }

  @OnEvent(EVENT_NAMES.MESSAGE_READ, { suppressErrors: false })
  async handleRead(
    payload: { tenantId: string; channel?: string } & Record<string, unknown>,
  ): Promise<void> {
    if (payload.channel === 'whatsapp')
      await this.workflowService.triggerWorkflow(
        payload.tenantId,
        'WHATSAPP_MESSAGE_READ',
        payload,
      );
  }

  @OnEvent(EVENT_NAMES.MESSAGE_FAILED, { suppressErrors: false })
  async handleFailed(
    payload: { tenantId: string; channel?: string } & Record<string, unknown>,
  ): Promise<void> {
    if (payload.channel === 'whatsapp')
      await this.workflowService.triggerWorkflow(
        payload.tenantId,
        'WHATSAPP_MESSAGE_FAILED',
        payload,
      );
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
