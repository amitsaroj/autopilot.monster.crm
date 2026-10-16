import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import axios from 'axios';

import { ContactService } from '../crm/contact.service';
import { LeadService } from '../crm/lead.service';
import { DealService } from '../crm/deal.service';
import { PipelineService } from '../crm/pipeline.service';
import { TaskCrmService, NoteService, EmailCrmService } from '../crm/crm-support.service';
import { EmailService } from '../../shared/email/email.service';
import { NotificationService } from '../notifications/notification.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { WhatsappTemplateService } from '../whatsapp/whatsapp-template.service';
import { VoiceCallService } from '../voice/voice-call.service';
import { TaskPriority } from '../../database/entities/task.entity';
import { ContactStatus } from '../../database/entities/contact.entity';
import {
  WorkflowExecutionContext,
  WorkflowStep,
  WorkflowStepResult,
} from './workflow-executor.service';
import { resolveWorkflowConfig } from './workflow-template.util';
import { WorkflowAiService } from './workflow-ai.service';
import { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';
import { publicWebhookAgents } from './workflow-webhook.util';
import { ShopifyIntegrationService } from '../commerce/shopify-integration.service';

const INLINE_DELAY_MAX_MS = 30_000;
const WEBHOOK_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
/** Caller-supplied webhook headers: these names plus custom x-* (no Host/routing/hop-by-hop). */
const WEBHOOK_HEADERS = new Set(['accept', 'authorization', 'content-type', 'user-agent']);

/** Keeps only safe, single-line string headers; anything else is dropped. */
export function safeWebhookHeaders(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  return Object.fromEntries(
    Object.entries(input).filter(
      ([name, value]) =>
        (WEBHOOK_HEADERS.has(name.toLowerCase()) || /^x-[a-z0-9-]+$/i.test(name)) &&
        !/^x-forwarded-/i.test(name) &&
        typeof value === 'string' &&
        !/[\r\n]/.test(value),
    ),
  ) as Record<string, string>;
}

@Injectable()
export class WorkflowActionExecutorService {
  constructor(
    private readonly contactService: ContactService,
    private readonly leadService: LeadService,
    private readonly dealService: DealService,
    private readonly pipelineService: PipelineService,
    private readonly taskService: TaskCrmService,
    private readonly noteService: NoteService,
    private readonly emailService: EmailService,
    private readonly emailCrmService: EmailCrmService,
    private readonly notificationService: NotificationService,
    private readonly whatsappService: WhatsappService,
    private readonly whatsappTemplateService: WhatsappTemplateService,
    private readonly voiceCallService: VoiceCallService,
    private readonly ai: WorkflowAiService,
    private readonly policy: WorkflowRuntimePolicyService,
    private readonly shopify: ShopifyIntegrationService,
  ) {}

  async executeAction(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
  ): Promise<WorkflowStepResult> {
    const config = resolveWorkflowConfig(step.config ?? {}, context);
    await this.policy.assertAction(context.tenantId, step, config);

    switch (step.type) {
      case 'CREATE_CONTACT':
        return this.createContact(step, context, config);
      case 'CREATE_LEAD':
        return this.createLead(step, context, config);
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
      case 'SEND_MESSAGE':
        return this.sendWhatsapp(step, context, config);
      case 'SEND_TEMPLATE':
        return this.sendWhatsappTemplate(step, context, config);
      case 'LOOKUP_SHOPIFY_ORDER':
        return this.lookupShopifyOrder(step, context, config);
      case 'ASSIGN_AGENT':
        return this.assignWhatsappAgent(step, context, config);
      case 'RESOLVE':
        return this.resolveWhatsappConversation(step, context, config);
      case 'NOTIFY_TEAM':
        return this.notifyTeam(step, context, config);
      case 'CALL_WEBHOOK':
        return this.callWebhook(step, context, config);
      case 'INITIATE_CALL':
      case 'MAKE_CALL':
        return this.initiateCall(step, context, config);
      case 'WAIT_DELAY':
      case 'DELAY':
      case 'AWAIT_RESPONSE':
        return this.executeDelay(step, config);
      case 'AI_CHAT':
      case 'AI_RESPONSE':
        return this.ai.execute(step, context, config);
      default:
        return {
          stepId: step.id,
          type: step.type,
          status: 'SKIPPED',
          reason: `Unsupported action type: ${step.type}`,
        };
    }
  }

  private async lookupShopifyOrder(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    if (!['WHATSAPP_MESSAGE_RECEIVED', 'WHATSAPP_KEYWORD'].includes(context.eventName))
      throw new Error('LOOKUP_SHOPIFY_ORDER is only available for inbound WhatsApp messages');
    const senderPhone = context.payload.phone;
    if (typeof senderPhone !== 'string' || !senderPhone.trim())
      throw new Error('LOOKUP_SHOPIFY_ORDER requires an inbound WhatsApp sender number');
    const orderName = config.orderName;
    if (typeof orderName !== 'string' || !orderName.trim())
      throw new Error('LOOKUP_SHOPIFY_ORDER requires an order number');
    const order = await this.shopify.lookupOrderStatus(context.tenantId, orderName, senderPhone);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      output: order,
    };
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

  private async createLead(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const firstName = config.firstName;
    if (typeof firstName !== 'string' || !firstName.trim() || firstName.length > 255)
      throw new Error('CREATE_LEAD requires a firstName of at most 255 characters');
    const optionalString = (key: string, maximum: number): string | undefined => {
      const value = config[key];
      if (value === undefined || value === null || value === '') return undefined;
      if (typeof value !== 'string' || value.length > maximum)
        throw new Error(`CREATE_LEAD ${key} must be a string of at most ${maximum} characters`);
      return value;
    };
    const email = optionalString('email', 255);
    if (email && !isEmail(email)) throw new Error('CREATE_LEAD email must be a valid email address');
    const phone =
      optionalString('phone', 50) ??
      (typeof context.payload.phone === 'string' ? context.payload.phone : undefined);
    if (phone && phone.length > 50)
      throw new Error('CREATE_LEAD phone must be at most 50 characters');
    const metadata = config.metadata;
    if (metadata !== undefined && (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)))
      throw new Error('CREATE_LEAD metadata must be an object');
    if (!context.idempotencyKey)
      throw new Error('CREATE_LEAD requires a workflow execution idempotency key');
    const currentDepth = Number(context.payload.workflowDepth ?? 0);
    if (!Number.isInteger(currentDepth) || currentDepth < 0 || currentDepth >= 8)
      throw new Error('Workflow event depth exceeded');
    const whatsappAttribution =
      context.payload.channel === 'whatsapp' &&
      ['WHATSAPP_MESSAGE_RECEIVED', 'WHATSAPP_KEYWORD'].includes(context.eventName) &&
      context.payload.attribution &&
      typeof context.payload.attribution === 'object' &&
      !Array.isArray(context.payload.attribution)
        ? (context.payload.attribution as Record<string, unknown>)
        : undefined;
    const lead = await this.leadService.createFromWorkflow(
      context.tenantId,
      {
        firstName: firstName.trim(),
        lastName: optionalString('lastName', 255),
        phone,
        email,
        source: optionalString('source', 100) ?? 'WhatsApp',
        metadata: {
          ...((metadata as Record<string, unknown> | undefined) ?? {}),
          ...(whatsappAttribution ? { whatsappAttribution } : {}),
        },
      },
      context.idempotencyKey,
      currentDepth + 1,
    );
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      output: { leadId: lead.id, score: lead.score },
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
      dueDate: dueDate.toISOString(),
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
    this.assertOrderLookupRecipient(context, toNumber);
    const message = String(config.message ?? config.body ?? config.text ?? '');

    if (!toNumber) {
      throw new Error('SEND_WHATSAPP requires toNumber');
    }
    if (!message) {
      throw new Error('SEND_WHATSAPP requires message');
    }

    const messageRecord = await this.whatsappService.sendTextMessage(
      context.tenantId,
      toNumber,
      message,
      typeof config.wabaId === 'string' ? config.wabaId : undefined,
      context.idempotencyKey,
    );

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      messageId: messageRecord.id,
      to: toNumber,
    };
  }

  private async sendWhatsappTemplate(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const toNumber = String(
      config.toNumber ?? config.to ?? config.phone ?? context.payload.phone ?? '',
    );
    this.assertOrderLookupRecipient(context, toNumber);
    if (!toNumber) {
      throw new Error('SEND_TEMPLATE requires toNumber');
    }

    let templateName = typeof config.templateName === 'string' ? config.templateName : '';
    let language =
      typeof config.language === 'string' && config.language ? config.language : 'en_US';
    const components = Array.isArray(config.components)
      ? config.components
      : Array.isArray(config.bodyParameters) && config.bodyParameters.length
        ? [
            {
              type: 'body',
              parameters: config.bodyParameters.map((text) => ({ type: 'text', text })),
            },
          ]
        : [];

    if (!templateName && typeof config.templateId === 'string' && config.templateId) {
      const template = await this.whatsappTemplateService.findOne(
        context.tenantId,
        config.templateId,
      );
      templateName = template.name;
      language = template.language || language;
    }

    if (!templateName) {
      throw new Error('SEND_TEMPLATE requires templateName or templateId');
    }

    const messageRecord = await this.whatsappService.sendTemplateMessage(
      context.tenantId,
      toNumber,
      templateName,
      language,
      components,
      typeof config.wabaId === 'string' ? config.wabaId : undefined,
      context.idempotencyKey,
    );

    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      messageId: messageRecord.id,
      to: toNumber,
    };
  }

  private assertOrderLookupRecipient(context: WorkflowExecutionContext, recipient: string): void {
    const hasVerifiedLookup = Object.values(context.outputs ?? {}).some((value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const result = value as Record<string, unknown>;
      return result.type === 'LOOKUP_SHOPIFY_ORDER' && result.status === 'COMPLETED';
    });
    if (!hasVerifiedLookup) return;

    const sender = context.payload.phone;
    const normalizedRecipient = recipient.replace(/\D/g, '');
    if (
      typeof sender !== 'string' ||
      !normalizedRecipient ||
      normalizedRecipient !== sender.replace(/\D/g, '')
    ) {
      throw new Error(
        'Order status can only be sent to the WhatsApp number verified for that order',
      );
    }
  }

  private async assignWhatsappAgent(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const phone = String(config.phone ?? context.payload.phone ?? '');
    const assigneeId = String(config.assigneeId ?? config.ownerId ?? config.userId ?? '');
    if (!phone) {
      throw new Error('ASSIGN_AGENT requires phone');
    }
    if (!assigneeId) {
      throw new Error('ASSIGN_AGENT requires assigneeId');
    }

    await this.whatsappService.assignConversation(context.tenantId, phone, assigneeId);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      ownerId: assigneeId,
      to: phone,
    };
  }

  private async resolveWhatsappConversation(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    config: Record<string, unknown>,
  ): Promise<WorkflowStepResult> {
    const phone = String(config.phone ?? context.payload.phone ?? '');
    if (!phone) {
      throw new Error('RESOLVE requires phone');
    }

    await this.whatsappService.resolveConversation(context.tenantId, phone);
    return {
      stepId: step.id,
      type: step.type,
      status: 'COMPLETED',
      to: phone,
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
    const to = String(config.to ?? config.toNumber ?? config.phone ?? context.payload.phone ?? '');
    if (!to) {
      throw new Error('INITIATE_CALL requires to phone number');
    }

    const wssUrl = await this.voiceCallService.buildStreamUrl(context.tenantId, {
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
    if (!WEBHOOK_METHODS.includes(method)) throw new Error('Unsupported webhook method');
    const seconds = Number(config.timeoutSeconds ?? 30);
    const timeout = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 30) * 1000 : 30000;
    const body = config.body ??
      config.payload ?? { eventName: context.eventName, payload: context.payload };

    // Validate the rendered URL (templates may resolve to anything) and pin its public DNS answer.
    const agents = await publicWebhookAgents(url);
    try {
      const response = await axios.request({
        url,
        method,
        headers: safeWebhookHeaders(config.headers),
        data: body,
        ...agents,
        proxy: false,
        maxRedirects: 0,
        timeout,
        signal: AbortSignal.timeout(timeout),
        maxContentLength: 65536,
        maxBodyLength: 1048576,
        responseType: 'text',
        validateStatus: () => true,
      });
      const host = new URL(url).host;
      if (response.status >= 300 && response.status < 400) {
        throw new Error(
          `Webhook ${host} redirected (HTTP ${response.status}); redirects are not followed`,
        );
      }
      if (response.status >= 400) {
        throw new Error(`Webhook ${host} returned HTTP ${response.status}`);
      }

      return {
        stepId: step.id,
        type: step.type,
        status: 'COMPLETED',
        httpStatus: response.status,
      };
    } finally {
      agents.httpAgent.destroy();
      agents.httpsAgent.destroy();
    }
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
    if (
      contact &&
      typeof contact === 'object' &&
      typeof (contact as { id?: unknown }).id === 'string'
    ) {
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
    const minutes = Number(config.timeoutMinutes ?? config.delayMinutes ?? 0);
    const seconds = Number(config.delaySeconds ?? config.seconds ?? 0);
    return (days * 24 * 3600 + hours * 3600 + minutes * 60 + seconds) * 1000;
  }
}
