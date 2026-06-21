import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { ContactService } from '../crm/contact.service';
import { DealService } from '../crm/deal.service';
import { PipelineService } from '../crm/pipeline.service';
import { TaskCrmService, NoteService, EmailCrmService } from '../crm/crm-support.service';
import { EmailService } from '../../shared/email/email.service';
import { NotificationService } from '../notifications/notification.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { VoiceCallService } from '../voice/voice-call.service';
import { TaskPriority } from '../../database/entities/task.entity';
import { ContactStatus } from '../../database/entities/contact.entity';
import {
  WorkflowExecutionContext,
  WorkflowStep,
  WorkflowStepResult,
} from './workflow-executor.service';
import { resolveWorkflowConfig, resolveWorkflowTemplate } from './workflow-template.util';

const INLINE_DELAY_MAX_MS = 30_000;

@Injectable()
export class WorkflowActionExecutorService {
  constructor(
    private readonly contactService: ContactService,
    private readonly dealService: DealService,
    private readonly pipelineService: PipelineService,
    private readonly taskService: TaskCrmService,
    private readonly noteService: NoteService,
    private readonly emailService: EmailService,
    private readonly emailCrmService: EmailCrmService,
    private readonly notificationService: NotificationService,
    private readonly whatsappService: WhatsappService,
    private readonly voiceCallService: VoiceCallService,
  ) {}

  async executeAction(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
  ): Promise<WorkflowStepResult> {
    const config = resolveWorkflowConfig(step.config ?? {}, context);

    switch (step.type) {
      case 'CREATE_CONTACT':
        return this.createContact(step, context, config);
      case 'UPDATE_CONTACT':
        return this.updateContact(step, context, config);
      case 'UPDATE_DEAL':
        return this.updateDeal(step, context, config);
      case 'CREATE_DEAL':
        return this.createDeal(step, context, config);
      case 'MOVE_PIPELINE_STAGE':
        return this.movePipelineStage(step, context, config);
      case 'ASSIGN_OWNER':
        return this.assignOwner(step, context, config);
      case 'ADD_TAG':
        return this.addTag(step, context, config);
      case 'CREATE_TASK':
        return this.createTask(step, context, config);
      case 'CREATE_NOTE':
      case 'ADD_NOTE':
        return this.createNote(step, context, config);
      case 'SEND_EMAIL':
        return this.sendEmail(step, context, config);
      case 'SEND_WHATSAPP':
        return this.sendWhatsapp(step, context, config);
      case 'NOTIFY_TEAM':
        return this.notifyTeam(step, context, config);
      case 'CALL_WEBHOOK':
        return this.callWebhook(step, context, config);
      case 'INITIATE_CALL':
      case 'MAKE_CALL':
        return this.initiateCall(step, context, config);
      case 'WAIT_DELAY':
      case 'DELAY':
        return this.executeDelay(step, config);
      case 'AI_CHAT':
      case 'AI_RESPONSE':
        return {
          stepId: step.id,
          type: step.type,
          status: 'SKIPPED',
          reason: 'AI execution is not wired yet',
        };
      default:
        return {
          stepId: step.id,
          type: step.type,
          status: 'SKIPPED',
          reason: `Unsupported action type: ${step.type}`,
        };
    }
  }

  private async createContact(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const firstName = String(config.firstName ?? 'Workflow');
    const lastName = String(config.lastName ?? 'Contact');
    const email = String(config.email ?? '');
    if (!email) {
      throw new Error('CREATE_CONTACT requires email in step config or resolved template');
    }

    const contact = await this.contactService.create(context.tenantId, {
      firstName,
      lastName,
      email,
      phone: typeof config.phone === 'string' ? config.phone : undefined,
      status: (config.status as ContactStatus | undefined) ?? ContactStatus.LEAD,
    });

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      contactId: contact.id,
    };
  }

  private async updateContact(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const contactId = this.resolveContactId(config, context);
    if (!contactId) {
      throw new Error('UPDATE_CONTACT requires contactId in config or trigger payload');
    }

    const field = String(config.field ?? '');
    const value = config.value;
    const updates: Record<string, unknown> = {};

    if (field) {
      updates[field] = value;
    } else {
      if (config.firstName !== undefined) updates.firstName = config.firstName;
      if (config.lastName !== undefined) updates.lastName = config.lastName;
      if (config.email !== undefined) updates.email = config.email;
      if (config.phone !== undefined) updates.phone = config.phone;
      if (config.status !== undefined) updates.status = config.status;
    }

    const contact = await this.contactService.update(context.tenantId, contactId, updates);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      contactId: contact.id,
    };
  }

  private async updateDeal(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const dealId = this.resolveDealId(config, context);
    if (!dealId) {
      throw new Error('UPDATE_DEAL requires dealId in config or trigger payload');
    }

    const field = String(config.field ?? '');
    const value = config.value;
    const updates: Record<string, unknown> = {};

    if (field) {
      updates[field] = value;
    } else {
      if (config.name !== undefined) updates.name = config.name;
      if (config.value !== undefined) updates.value = Number(config.value);
      if (config.probability !== undefined) updates.probability = Number(config.probability);
      if (config.stageId !== undefined) updates.stageId = config.stageId;
      if (config.status !== undefined) updates.status = config.status;
    }

    const deal = await this.dealService.update(context.tenantId, dealId, updates);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      dealId: deal.id,
    };
  }

  private async createDeal(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const name = String(config.name ?? 'Workflow deal');
    let pipelineId = typeof config.pipelineId === 'string' ? config.pipelineId : undefined;
    let stageId = typeof config.stageId === 'string' ? config.stageId : undefined;

    if (!pipelineId || !stageId) {
      const pipeline = await this.pipelineService.findDefault(context.tenantId);
      if (!pipeline) {
        throw new Error('CREATE_DEAL requires pipelineId/stageId or a default pipeline');
      }
      pipelineId = pipelineId ?? pipeline.id;
      stageId = stageId ?? pipeline.stages?.[0]?.id;
      if (!stageId) {
        throw new Error('CREATE_DEAL requires stageId or pipeline with stages');
      }
    }

    const deal = await this.dealService.create(context.tenantId, {
      name,
      pipelineId,
      stageId,
      contactId: this.resolveContactId(config, context),
      companyId: typeof config.companyId === 'string' ? config.companyId : undefined,
      value: config.value !== undefined ? Number(config.value) : undefined,
      ownerId: typeof config.ownerId === 'string' ? config.ownerId : undefined,
    });

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      dealId: deal.id,
    };
  }

  private async movePipelineStage(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const dealId = this.resolveDealId(config, context);
    const stageId = String(config.stageId ?? config.toStageId ?? '');
    if (!dealId || !stageId) {
      throw new Error('MOVE_PIPELINE_STAGE requires dealId and stageId');
    }

    const deal = await this.dealService.moveStage(context.tenantId, dealId, stageId);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      dealId: deal.id,
      stageId: deal.stageId,
    };
  }

  private async assignOwner(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const ownerId = String(config.ownerId ?? config.userId ?? config.assigneeId ?? '');
    if (!ownerId) {
      throw new Error('ASSIGN_OWNER requires ownerId in step config');
    }

    const entityType = String(config.entityType ?? 'contact').toLowerCase();
    if (entityType === 'deal') {
      const dealId = this.resolveDealId(config, context);
      if (!dealId) {
        throw new Error('ASSIGN_OWNER for deal requires dealId');
      }
      const deal = await this.dealService.update(context.tenantId, dealId, { ownerId });
      return {
        stepId: step.id,
        type: step.type,
        status: 'COMPLETED',
        dealId: deal.id,
        ownerId,
      };
    }

    const contactId = this.resolveContactId(config, context);
    if (!contactId) {
      throw new Error('ASSIGN_OWNER for contact requires contactId');
    }
    const contact = await this.contactService.assignOwner(context.tenantId, contactId, ownerId);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      contactId: contact.id,
      ownerId,
    };
  }

  private async addTag(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const tag = String(config.tag ?? config.tagName ?? '');
    if (!tag) {
      throw new Error('ADD_TAG requires tag in step config');
    }

    const contactId = this.resolveContactId(config, context);
    if (!contactId) {
      throw new Error('ADD_TAG requires contactId in config or trigger payload');
    }

    const contact = await this.contactService.addTag(context.tenantId, contactId, tag);

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      contactId: contact.id,
      tag,
    };
  }

  private async createTask(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const title = String(config.title ?? step.name ?? 'Workflow task');
    const dueInHours = Number(config.dueInHours ?? 24);
    const dueDate = new Date(Date.now() + dueInHours * 60 * 60 * 1000);
    const priority = this.resolveTaskPriority(config.priority);

    const task = await this.taskService.create(context.tenantId, {
      title,
      description:
        typeof config.description === 'string'
          ? config.description
          : `Created by workflow event ${context.eventName}`,
      contactId: this.resolveContactId(config, context),
      dealId: this.resolveDealId(config, context),
      assigneeId: typeof config.assigneeId === 'string' ? config.assigneeId : undefined,
      priority,
      dueDate,
    });

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      taskId: task.id,
    };
  }

  private async createNote(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const title = String(config.title ?? step.name ?? 'Workflow note');
    const content = String(config.content ?? config.message ?? 'Automated workflow note');
    const contactId = this.resolveContactId(config, context);
    const dealId = this.resolveDealId(config, context);

    const note = await this.noteService.create(context.tenantId, {
      title,
      content,
      contactId,
      dealId,
      tags: Array.isArray(config.tags) ? config.tags.map(String) : [],
    });

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      noteId: note.id,
    };
  }

  private async sendEmail(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const to = String(config.to ?? config.recipient ?? '');
    const subject = String(config.subject ?? 'Workflow notification');
    const html = String(config.html ?? config.body ?? config.message ?? subject);

    if (!to) {
      throw new Error('SEND_EMAIL requires a recipient (to)');
    }

    const sent = await this.emailService.sendEmail(to, subject, html);
    if (!sent) {
      throw new Error(`Failed to send email to ${to}`);
    }

    const contactId = this.resolveContactId(config, context);
    if (contactId) {
      await this.emailCrmService.sendEmail(context.tenantId, {
        contactId,
        to,
        subject,
        body: html,
      });
    }

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      to,
      subject,
    };
  }

  private async sendWhatsapp(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const toNumber = String(
      config.toNumber ?? config.to ?? config.phone ?? context.payload.phone ?? '',
    );
    const message = String(config.message ?? config.body ?? config.text ?? '');

    if (!toNumber) {
      throw new Error('SEND_WHATSAPP requires toNumber');
    }
    if (!message) {
      throw new Error('SEND_WHATSAPP requires message');
    }

    const resolvedMessage = resolveWorkflowTemplate(message, context);
    const messageRecord = await this.whatsappService.sendTextMessage(
      context.tenantId,
      toNumber,
      resolvedMessage,
      typeof config.wabaId === 'string' ? config.wabaId : undefined,
    );

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      messageId: messageRecord.id,
      to: toNumber,
    };
  }

  private async notifyTeam(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const title = String(config.title ?? config.subject ?? step.name ?? 'Workflow alert');
    const content = String(config.message ?? config.content ?? `Event: ${context.eventName}`);
    const userId = typeof config.userId === 'string' ? config.userId : undefined;

    const notification = await this.notificationService.create(context.tenantId, {
      userId,
      type: 'IN_APP',
      title,
      content,
      status: 'UNREAD',
      meta: {
        eventName: context.eventName,
        workflowStepId: step.id,
      },
    });

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      notificationId: notification.id,
    };
  }

  private async initiateCall(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const to = String(
      config.to ?? config.toNumber ?? config.phone ?? context.payload.phone ?? '',
    );
    if (!to) {
      throw new Error('INITIATE_CALL requires to phone number');
    }

    const wssUrl = this.voiceCallService.buildStreamUrl(context.tenantId, {
      agentId: typeof config.agentId === 'string' ? config.agentId : undefined,
      leadId: typeof config.leadId === 'string' ? config.leadId : undefined,
      voice: typeof config.voice === 'string' ? config.voice : undefined,
    });

    const call = await this.voiceCallService.initiateOutbound(context.tenantId, {
      to,
      wssUrl,
      voiceProfile: typeof config.voice === 'string' ? config.voice : undefined,
    });

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      callId: call.id,
      to,
    };
  }

  private async callWebhook(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const url = String(config.url ?? '');
    if (!url) {
      throw new Error('CALL_WEBHOOK requires url');
    }

    const method = String(config.method ?? 'POST').toUpperCase();
    const headers =
      config.headers && typeof config.headers === 'object'
        ? (config.headers as Record<string, string>)
        : {};
    const body = config.body ?? config.payload ?? { eventName: context.eventName, payload: context.payload };

    const response = await axios.request({
      url,
      method,
      headers,
      data: body,
      timeout: Number(config.timeoutSeconds ?? 30) * 1000,
      validateStatus: () => true,
    });

    if (response.status >= 400) {
      throw new Error(`Webhook ${url} returned HTTP ${response.status}`);
    }

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      httpStatus: response.status,
    };
  }

  private async executeDelay(
    step: WorkflowStep,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const delayMs = this.resolveDelayMs(config);

    if (delayMs <= 0) {
      return {
        stepId: step.id,
        type: step.type,
        status: 'COMPLETED',
        delayedMs: 0,
      };
    }

    if (delayMs > INLINE_DELAY_MAX_MS) {
      return {
        stepId: step.id,
        type: step.type,
        status: 'SCHEDULED',
        delayMs,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      delayedMs: delayMs,
    };
  }

  private resolveContactId(
    config: Record<string, unknown>,
    context: WorkflowExecutionContext,
  ): string | undefined {
    if (typeof config.contactId === 'string' && config.contactId) {
      return config.contactId;
    }
    if (typeof context.payload.contactId === 'string') {
      return context.payload.contactId;
    }
    const contact = context.payload.contact;
    if (contact && typeof contact === 'object' && typeof (contact as { id?: unknown }).id === 'string') {
      return (contact as { id: string }).id;
    }
    return undefined;
  }

  private resolveDealId(
    config: Record<string, unknown>,
    context: WorkflowExecutionContext,
  ): string | undefined {
    if (typeof config.dealId === 'string' && config.dealId) {
      return config.dealId;
    }
    if (typeof context.payload.dealId === 'string') {
      return context.payload.dealId;
    }
    const deal = context.payload.deal;
    if (deal && typeof deal === 'object' && typeof (deal as { id?: unknown }).id === 'string') {
      return (deal as { id: string }).id;
    }
    return undefined;
  }

  private resolveTaskPriority(value: unknown): TaskPriority {
    const normalized = String(value ?? TaskPriority.MEDIUM).toUpperCase();
    if (normalized === TaskPriority.HIGH) {
      return TaskPriority.HIGH;
    }
    if (normalized === TaskPriority.LOW) {
      return TaskPriority.LOW;
    }
    return TaskPriority.MEDIUM;
  }

  private resolveDelayMs(config: Record<string, unknown>): number {
    const hours = Number(config.delayHours ?? 0);
    const days = Number(config.delayDays ?? 0);
    const seconds = Number(config.delaySeconds ?? config.seconds ?? 0);
    return (days * 24 * 3600 + hours * 3600 + seconds) * 1000;
  }
}
