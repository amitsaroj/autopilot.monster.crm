import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../events/event.constants';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookEventListener {
  constructor(private readonly webhooks: WebhookService) {}

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
}
