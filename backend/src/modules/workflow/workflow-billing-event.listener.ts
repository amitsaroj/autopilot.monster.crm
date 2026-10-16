import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENT_NAMES } from '../../events/event.constants';
import { WorkflowService } from './workflow.service';

const SAFE_BILLING_FIELDS = [
  'subscriptionId',
  'paymentId',
  'invoiceId',
  'planId',
  'status',
  'currency',
] as const;

@Injectable()
export class WorkflowBillingEventListener {
  constructor(private readonly workflowService: WorkflowService) {}

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_CREATED, { suppressErrors: false })
  subscriptionCreated(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.SUBSCRIPTION_CREATED, 'SUBSCRIPTION_CREATED', payload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_UPDATED, { suppressErrors: false })
  subscriptionUpdated(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.SUBSCRIPTION_UPDATED, 'SUBSCRIPTION_UPDATED', payload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_CANCELLED, { suppressErrors: false })
  subscriptionCancelled(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.SUBSCRIPTION_CANCELLED, 'SUBSCRIPTION_CANCELLED', payload);
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_RENEWED, { suppressErrors: false })
  subscriptionRenewed(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.SUBSCRIPTION_RENEWED, 'SUBSCRIPTION_RENEWED', payload);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_SUCCEEDED, { suppressErrors: false })
  paymentSucceeded(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.PAYMENT_SUCCEEDED, 'PAYMENT_SUCCEEDED', payload);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_FAILED, { suppressErrors: false })
  paymentFailed(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.PAYMENT_FAILED, 'PAYMENT_FAILED', payload);
  }

  @OnEvent(EVENT_NAMES.PAYMENT_REFUNDED, { suppressErrors: false })
  paymentRefunded(payload: Record<string, unknown>): Promise<void> {
    return this.forward(EVENT_NAMES.PAYMENT_REFUNDED, 'PAYMENT_REFUNDED', payload);
  }

  private async forward(
    sourceEvent: string,
    trigger: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (
      typeof payload.tenantId !== 'string' ||
      !payload.tenantId.trim() ||
      typeof payload.eventId !== 'string' ||
      !payload.eventId.trim()
    ) {
      return;
    }

    const safePayload: Record<string, unknown> = { eventId: payload.eventId };
    for (const field of SAFE_BILLING_FIELDS) {
      if (typeof payload[field] === 'string') safePayload[field] = payload[field];
    }
    if (typeof payload.amount === 'number' && Number.isFinite(payload.amount)) {
      safePayload.amount = payload.amount;
    }
    if (typeof payload.currentPeriodEnd === 'string') {
      safePayload.currentPeriodEnd = payload.currentPeriodEnd;
    }

    await this.workflowService.triggerWorkflow(
      payload.tenantId,
      trigger,
      safePayload,
      undefined,
      `${sourceEvent}:${payload.eventId}`,
    );
  }
}
