import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, MoreThan } from 'typeorm';
import { Contact, ContactStatus } from '../../database/entities/contact.entity';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';
import { WhatsappConsentService } from '../whatsapp/whatsapp-consent.service';
import {
  sequencePolicy,
  type WorkflowSequencePolicy,
  type WorkflowStep,
} from './workflow-definition';
import type { WorkflowStepResult } from './workflow-executor.service';

export function nextBusinessOpening(
  hours: NonNullable<WorkflowSequencePolicy['businessHours']>,
  now: Date,
): Date | null {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: hours.timezone,
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const open = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const day = weekdays.indexOf(parts.find((part) => part.type === 'weekday')!.value);
    const hour = Number(parts.find((part) => part.type === 'hour')!.value);
    return hours.days.includes(day) && hour >= hours.startHour && hour < hours.endHour;
  };
  if (open(now)) return null;
  // shortcut: openings are checked in 15-minute increments, upgrade if minute-level scheduling is offered.
  for (
    let time = Math.ceil((now.getTime() + 1) / 900000) * 900000;
    time <= now.getTime() + 8 * 86400000;
    time += 900000
  ) {
    const candidate = new Date(time);
    if (open(candidate)) return candidate;
  }
  throw new BadRequestException('No business opening found for the configured weekdays');
}

@Injectable()
export class WorkflowSequenceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly consent: WhatsappConsentService,
  ) {}

  async inspect(execution: WorkflowExecution) {
    const definition = execution.definitionSnapshot ?? {};
    const policy = sequencePolicy(definition.sequence);
    const payload = { ...execution.input.payload };
    const contactId =
      payload.contactId ?? (payload.contact as Record<string, unknown> | undefined)?.id;
    const dealId = payload.dealId ?? (payload.deal as Record<string, unknown> | undefined)?.id;
    let contact: Contact | null = null;
    let deal: Deal | null = null;
    for (const id of [contactId, dealId]) {
      if (
        id !== undefined &&
        (typeof id !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
      )
        throw new BadRequestException('Sequence CRM references must be UUIDs');
    }
    if (typeof contactId === 'string') {
      contact = await this.dataSource
        .getRepository(Contact)
        .findOneBy({ tenantId: execution.tenantId, id: contactId });
      if (!contact) return { payload, stopReason: 'CONTACT_UNAVAILABLE' };
      payload.contact = contact;
    }
    if (typeof dealId === 'string') {
      deal = await this.dataSource
        .getRepository(Deal)
        .findOne({ where: { tenantId: execution.tenantId, id: dealId }, relations: ['contact'] });
      if (!deal) return { payload, stopReason: 'DEAL_UNAVAILABLE' };
      if (deal.contact && deal.contact.tenantId !== execution.tenantId)
        return { payload, stopReason: 'CONTACT_UNAVAILABLE' };
      payload.deal = deal;
      contact ??= deal.contact ?? null;
    }
    const phone =
      typeof payload.phone === 'string' ? payload.phone : contact?.mobile || contact?.phone;
    if (phone && !(await this.eligible(execution.tenantId, phone)))
      return { payload, stopReason: 'RECIPIENT_OPTED_OUT' };
    if (
      policy.stopOnConversion &&
      (contact?.status === ContactStatus.CUSTOMER || deal?.status === DealStatus.WON)
    ) {
      return { payload, stopReason: 'CONVERSION_REACHED' };
    }
    if (policy.stopOnReply && phone && (await this.reply(execution, phone, execution.startedAt)))
      return { payload, stopReason: 'CUSTOMER_REPLIED' };
    return { payload, stopReason: null };
  }

  private async eligible(tenantId: string, phone: string) {
    return (await this.consent.getEligibility(tenantId, phone, 'SERVICE')).eligible;
  }

  private reply(execution: WorkflowExecution, phone: string, after: Date) {
    const phoneNumberId = execution.definitionSnapshot?.phoneNumberId;
    if (typeof phoneNumberId !== 'string' || !phoneNumberId)
      throw new BadRequestException('Reply waits require a connected sending account');
    return this.dataSource.getRepository(WhatsAppMessage).findOne({
      where: {
        tenantId: execution.tenantId,
        phoneNumberId,
        from: this.consent.normalizePhone(phone),
        direction: 'INBOUND',
        createdAt: MoreThan(after),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async wait(
    step: WorkflowStep,
    config: Record<string, unknown>,
    execution: WorkflowExecution,
    startedAt: string,
    payload: Record<string, unknown>,
    conditionMet?: boolean,
  ): Promise<WorkflowStepResult> {
    const deadline = Date.parse(startedAt) + Number(config.timeoutMinutes ?? 1440) * 60000;
    let reply: WhatsAppMessage | null = null;
    if (step.type === 'WAIT_FOR_REPLY') {
      const phone = String(
        config.phone ??
          payload.phone ??
          (payload.contact as Contact | undefined)?.mobile ??
          (payload.contact as Contact | undefined)?.phone ??
          '',
      );
      if (!phone) throw new BadRequestException('Reply waits require a recipient phone');
      let after = execution.startedAt;
      for (const prior of execution.output.steps) {
        if (prior.status !== 'COMPLETED') continue;
        const date = ['SEND_WHATSAPP', 'SEND_TEMPLATE'].includes(prior.type)
          ? prior.startedAt
          : prior.type === 'WAIT_FOR_REPLY' && typeof prior.output?.receivedAt === 'string'
            ? prior.output.receivedAt
            : undefined;
        if (date && Date.parse(date) > after.getTime()) after = new Date(date);
      }
      reply = await this.reply(execution, phone, after);
    }
    if (reply || conditionMet)
      return {
        stepId: step.id,
        type: step.type,
        status: 'COMPLETED',
        output: reply
          ? { body: reply.body, messageId: reply.id, receivedAt: reply.createdAt.toISOString() }
          : { conditionMet: true },
      };
    if (Date.now() >= deadline)
      return { stepId: step.id, type: step.type, status: 'COMPLETED', reason: 'WAIT_TIMEOUT' };
    return {
      stepId: step.id,
      type: step.type,
      status: 'SCHEDULED',
      delayMs: Math.min(30000, deadline - Date.now()),
    };
  }
}
