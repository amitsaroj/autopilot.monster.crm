import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../events/event.constants';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookEventListener {
  constructor(private readonly webhooks: WebhookService) {}

  private async dispatchCrm(
    event: string,
    payload: Record<string, unknown>,
    entityName: 'contact' | 'lead' | 'deal' | 'company',
    merge = false,
  ): Promise<void> {
    if (typeof payload.tenantId !== 'string' || !payload.tenantId) return;
    const entity = payload[entityName];
    const details =
      entity && typeof entity === 'object' && !Array.isArray(entity)
        ? (entity as Record<string, unknown>)
        : undefined;
    const idValue = details?.id ?? payload[`${entityName}Id`] ?? payload.primaryId;
    if (typeof idValue !== 'string' || !idValue) return;
    const secondaryId =
      merge && typeof payload.secondaryId === 'string' ? payload.secondaryId : undefined;
    const version =
      details?.updatedAt ??
      details?.createdAt ??
      (typeof payload.newStageId === 'string' ? payload.newStageId : undefined);
    const eventId = [
      event,
      idValue,
      secondaryId ?? '',
      version instanceof Date ? version.toISOString() : String(version ?? ''),
    ]
      .filter(Boolean)
      .join(':');
    const safePayload: Record<string, unknown> = {
      eventId,
      [`${entityName}Id`]: idValue,
    };
    if (secondaryId) safePayload.mergedEntityId = secondaryId;
    for (const key of ['status', 'stageId', 'oldStageId', 'newStageId']) {
      const value = details?.[key] ?? payload[key];
      if (typeof value === 'string') safePayload[key] = value;
    }
    for (const key of ['score', 'probability']) {
      const value = details?.[key];
      if (typeof value === 'number' && Number.isFinite(value)) safePayload[key] = value;
    }
    await this.webhooks.dispatch(payload.tenantId, event, safePayload);
  }

  private async dispatch(event: string, payload: Record<string, unknown>): Promise<void> {
    if (payload.channel !== 'whatsapp' || typeof payload.tenantId !== 'string' || !payload.tenantId)
      return;
    const safePayload: Record<string, unknown> = { channel: 'whatsapp' };
    // IDs support reconciliation without exporting message bodies, contacts or credentials.
    for (const key of ['messageSid', 'eventId', 'contactId', 'phoneNumberId', 'messageType']) {
      if (typeof payload[key] === 'string') safePayload[key] = payload[key];
    }
    await this.webhooks.dispatch(payload.tenantId, event, safePayload);
  }

  private async dispatchWorkflow(event: string, payload: Record<string, unknown>): Promise<void> {
    if (
      typeof payload.tenantId !== 'string' ||
      !payload.tenantId ||
      typeof payload.workflowId !== 'string' ||
      typeof payload.executionId !== 'string' ||
      typeof payload.eventId !== 'string'
    )
      return;
    await this.webhooks.dispatch(payload.tenantId, event, {
      workflowId: payload.workflowId,
      executionId: payload.executionId,
      versionId: typeof payload.versionId === 'string' ? payload.versionId : null,
      eventId: payload.eventId,
    });
  }

  private async dispatchBilling(event: string, payload: Record<string, unknown>): Promise<void> {
    if (typeof payload.tenantId !== 'string' || !payload.tenantId) return;
    if (typeof payload.eventId !== 'string' || !payload.eventId) return;
    const safePayload: Record<string, unknown> = { eventId: payload.eventId };
    for (const key of [
      'subscriptionId',
      'paymentId',
      'invoiceId',
      'planId',
      'status',
      'currency',
    ]) {
      if (typeof payload[key] === 'string') safePayload[key] = payload[key];
    }
    if (typeof payload.amount === 'number' && Number.isFinite(payload.amount))
      safePayload.amount = payload.amount;
    if (typeof payload.currentPeriodEnd === 'string')
      safePayload.currentPeriodEnd = payload.currentPeriodEnd;
    await this.webhooks.dispatch(payload.tenantId, event, safePayload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_CREATED, { suppressErrors: false })
  subscriptionCreated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.SUBSCRIPTION_CREATED, payload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_UPDATED, { suppressErrors: false })
  subscriptionUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.SUBSCRIPTION_UPDATED, payload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_CANCELLED, { suppressErrors: false })
  subscriptionCancelled(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.SUBSCRIPTION_CANCELLED, payload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_RENEWED, { suppressErrors: false })
  subscriptionRenewed(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.SUBSCRIPTION_RENEWED, payload);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_SUCCEEDED, { suppressErrors: false })
  paymentSucceeded(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.PAYMENT_SUCCEEDED, payload);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_FAILED, { suppressErrors: false })
  paymentFailed(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.PAYMENT_FAILED, payload);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_REFUNDED, { suppressErrors: false })
  paymentRefunded(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchBilling(EVENT_NAMES.PAYMENT_REFUNDED, payload);
  }

  private async dispatchConversationTransition(
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (typeof payload.tenantId !== 'string' || !payload.tenantId) return;
    if (typeof payload.eventId !== 'string' || typeof payload.contactId !== 'string') return;
    const safePayload: Record<string, unknown> = {
      eventId: payload.eventId,
      contactId: payload.contactId,
      status: event === EVENT_NAMES.WHATSAPP_CONVERSATION_RESOLVED ? 'RESOLVED' : 'OPEN',
    };
    if (typeof payload.phoneNumberId === 'string')
      safePayload.phoneNumberId = payload.phoneNumberId;
    await this.webhooks.dispatch(payload.tenantId, event, safePayload);
  }

  @OnEvent(EVENT_NAMES.MESSAGE_RECEIVED, { suppressErrors: false })
  received(payload: Record<string, unknown>): Promise<void> {
    return this.dispatch(EVENT_NAMES.MESSAGE_RECEIVED, payload);
  }

  @OnEvent(EVENT_NAMES.MESSAGE_SENT)
  sent(payload: Record<string, unknown>): Promise<void> {
    return this.dispatch(EVENT_NAMES.MESSAGE_SENT, payload);
  }

  @OnEvent(EVENT_NAMES.MESSAGE_DELIVERED, { suppressErrors: false })
  delivered(payload: Record<string, unknown>): Promise<void> {
    return this.dispatch(EVENT_NAMES.MESSAGE_DELIVERED, payload);
  }

  @OnEvent(EVENT_NAMES.MESSAGE_READ, { suppressErrors: false })
  read(payload: Record<string, unknown>): Promise<void> {
    return this.dispatch(EVENT_NAMES.MESSAGE_READ, payload);
  }

  @OnEvent(EVENT_NAMES.MESSAGE_FAILED, { suppressErrors: false })
  failed(payload: Record<string, unknown>): Promise<void> {
    return this.dispatch(EVENT_NAMES.MESSAGE_FAILED, payload);
  }

  private async dispatchShopify(event: string, payload: Record<string, unknown>): Promise<void> {
    if (typeof payload.tenantId !== 'string' || !payload.tenantId) return;
    if (typeof payload.eventId !== 'string' || !payload.eventId) return;
    const safePayload: Record<string, unknown> = { eventId: payload.eventId };
    if (typeof payload.shop === 'string') safePayload.shop = payload.shop;
    for (const key of ['updatedAt', 'completedAt', 'currency', 'totalPrice']) {
      if (typeof payload[key] === 'string') safePayload[key] = payload[key];
      if (key === 'completedAt' && payload[key] === null) safePayload[key] = null;
    }
    if (typeof payload.itemCount === 'number' && Number.isSafeInteger(payload.itemCount))
      safePayload.itemCount = payload.itemCount;
    await this.webhooks.dispatch(payload.tenantId, event, safePayload);
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_CHECKOUT_CREATED, { suppressErrors: false })
  shopifyCheckoutCreated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchShopify(EVENT_NAMES.SHOPIFY_CHECKOUT_CREATED, payload);
  }

  @OnEvent(EVENT_NAMES.SHOPIFY_CHECKOUT_UPDATED, { suppressErrors: false })
  shopifyCheckoutUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchShopify(EVENT_NAMES.SHOPIFY_CHECKOUT_UPDATED, payload);
  }

  @OnEvent(EVENT_NAMES.WHATSAPP_CONVERSATION_RESOLVED, { suppressErrors: false })
  conversationResolved(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchConversationTransition(EVENT_NAMES.WHATSAPP_CONVERSATION_RESOLVED, payload);
  }

  @OnEvent(EVENT_NAMES.WHATSAPP_CONVERSATION_REOPENED, { suppressErrors: false })
  conversationReopened(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchConversationTransition(EVENT_NAMES.WHATSAPP_CONVERSATION_REOPENED, payload);
  }

  @OnEvent(EVENT_NAMES.WORKFLOW_STARTED, { suppressErrors: false })
  workflowStarted(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchWorkflow(EVENT_NAMES.WORKFLOW_STARTED, payload);
  }

  @OnEvent(EVENT_NAMES.WORKFLOW_COMPLETED, { suppressErrors: false })
  workflowCompleted(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchWorkflow(EVENT_NAMES.WORKFLOW_COMPLETED, payload);
  }

  @OnEvent(EVENT_NAMES.WORKFLOW_FAILED, { suppressErrors: false })
  workflowFailed(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchWorkflow(EVENT_NAMES.WORKFLOW_FAILED, payload);
  }

  @OnEvent(EVENT_NAMES.CONTACT_CREATED, { suppressErrors: false })
  contactCreated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.CONTACT_CREATED, payload, 'contact');
  }

  @OnEvent(EVENT_NAMES.CONTACT_UPDATED, { suppressErrors: false })
  contactUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.CONTACT_UPDATED, payload, 'contact');
  }

  @OnEvent(EVENT_NAMES.CONTACT_DELETED, { suppressErrors: false })
  contactDeleted(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.CONTACT_DELETED, payload, 'contact');
  }

  @OnEvent(EVENT_NAMES.CONTACT_MERGED, { suppressErrors: false })
  contactMerged(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.CONTACT_MERGED, payload, 'contact', true);
  }

  @OnEvent(EVENT_NAMES.COMPANY_CREATED, { suppressErrors: false })
  companyCreated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.COMPANY_CREATED, payload, 'company');
  }

  @OnEvent(EVENT_NAMES.COMPANY_UPDATED, { suppressErrors: false })
  companyUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.COMPANY_UPDATED, payload, 'company');
  }

  @OnEvent(EVENT_NAMES.COMPANY_DELETED, { suppressErrors: false })
  companyDeleted(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.COMPANY_DELETED, payload, 'company');
  }

  @OnEvent(EVENT_NAMES.COMPANY_MERGED, { suppressErrors: false })
  companyMerged(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.COMPANY_MERGED, payload, 'company', true);
  }

  @OnEvent(EVENT_NAMES.LEAD_CREATED, { suppressErrors: false })
  leadCreated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.LEAD_CREATED, payload, 'lead');
  }

  @OnEvent(EVENT_NAMES.LEAD_UPDATED, { suppressErrors: false })
  leadUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.LEAD_UPDATED, payload, 'lead');
  }

  @OnEvent(EVENT_NAMES.LEAD_DELETED, { suppressErrors: false })
  leadDeleted(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.LEAD_DELETED, payload, 'lead');
  }

  @OnEvent(EVENT_NAMES.DEAL_CREATED, { suppressErrors: false })
  dealCreated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.DEAL_CREATED, payload, 'deal');
  }

  @OnEvent(EVENT_NAMES.DEAL_UPDATED, { suppressErrors: false })
  dealUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.DEAL_UPDATED, payload, 'deal');
  }

  @OnEvent(EVENT_NAMES.DEAL_DELETED, { suppressErrors: false })
  dealDeleted(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.DEAL_DELETED, payload, 'deal');
  }

  @OnEvent(EVENT_NAMES.DEAL_STAGE_CHANGED, { suppressErrors: false })
  dealStageChanged(payload: Record<string, unknown>): Promise<void> {
    return this.dispatchCrm(EVENT_NAMES.DEAL_STAGE_CHANGED, payload, 'deal');
  }
}
