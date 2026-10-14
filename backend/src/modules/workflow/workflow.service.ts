import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EntityManager } from 'typeorm';
import { Queue } from 'bull';
import { createHash } from 'crypto';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { WorkflowRepository } from './workflow.repository';
import { CreateWorkflowDto, WorkflowPreviewDto } from './dto/workflow.dto';
import { Flow } from '../../database/entities/flow.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';
import { compileWorkflow, record, WorkflowPlan, validateStepConfig } from './workflow-definition';
import { WorkflowExecutorService } from './workflow-executor.service';
import { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';
import { resolveWorkflowConfig } from './workflow-template.util';
import { validateWebhookUrl } from './workflow-webhook.util';

@Injectable()
export class WorkflowService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowService.name);
  private recovering = false;

  constructor(
    @InjectQueue(QUEUE_NAMES.WORKFLOW) private readonly workflowQueue: Queue,
    private readonly workflowRepo: WorkflowRepository,
    private readonly executor: WorkflowExecutorService,
    private readonly policy: WorkflowRuntimePolicyService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.recoverDispatches();
  }

  findAll(tenantId: string): Promise<Flow[]> {
    return this.workflowRepo.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Flow> {
    const flow = await this.workflowRepo.findById(tenantId, id);
    if (!flow) throw new NotFoundException('Workflow not found');
    return flow;
  }

  private async validatePublication(
    tenantId: string,
    flow: Flow,
    manager?: EntityManager,
  ): Promise<WorkflowPlan> {
    const plan = compileWorkflow(flow.definition);
    await this.policy.assertFlow(tenantId, flow, 'publish');
    for (const step of plan.steps) {
      await this.policy.assertReferences(tenantId, step.config ?? {}, true, manager);
      if (step.type === 'CALL_WEBHOOK' && !String(step.config?.url).includes('{{'))
        validateWebhookUrl(String(step.config?.url));
    }
    return plan;
  }

  /** Optional manager keeps marketplace installation and flow/version creation atomic. */
  async create(tenantId: string, dto: CreateWorkflowDto, manager?: EntityManager): Promise<Flow> {
    const work = async (em: EntityManager): Promise<Flow> => {
      const definition = {
        ...record(dto.definition, 'definition'),
        ...(dto.triggerEvent ? { triggerEvent: dto.triggerEvent } : {}),
      };
      const flow = em.getRepository(Flow).create({
        tenantId,
        name: dto.name,
        description: dto.description,
        type: dto.type ?? 'voice',
        definition,
        isPublished: dto.isPublished ?? false,
      });
      if (flow.isPublished) await this.validatePublication(tenantId, flow, em);
      const saved = await this.workflowRepo.saveFlow(tenantId, flow, em);
      if (saved.isPublished) {
        const version = await this.workflowRepo.snapshot(saved, em);
        saved.publishedVersionId = version.id;
        await em
          .getRepository(Flow)
          .update({ id: saved.id, tenantId }, { publishedVersionId: version.id });
      }
      return saved;
    };
    return manager ? work(manager) : this.workflowRepo.transaction(work);
  }

  async update(
    tenantId: string,
    id: string,
    dto: Partial<CreateWorkflowDto>,
    manager?: EntityManager,
  ): Promise<Flow> {
    const work = async (em: EntityManager) => {
      const repo = em.getRepository(Flow);
      const flow = await repo.findOne({
        where: { id, tenantId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!flow) throw new NotFoundException('Workflow not found');
      if (dto.name !== undefined) flow.name = dto.name;
      if (dto.description !== undefined) flow.description = dto.description;
      if (dto.type !== undefined) flow.type = dto.type;
      if (dto.definition !== undefined) flow.definition = record(dto.definition, 'definition');
      if (dto.triggerEvent !== undefined)
        flow.definition = { ...flow.definition, triggerEvent: dto.triggerEvent };
      if (dto.isPublished !== undefined) flow.isPublished = dto.isPublished;
      if (flow.isPublished) {
        await this.validatePublication(tenantId, flow, em);
        flow.publishedVersionId = (await this.workflowRepo.snapshot(flow, em)).id;
      }
      return repo.save(flow);
    };
    return manager ? work(manager) : this.workflowRepo.transaction(work);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.workflowRepo.delete(tenantId, id);
  }

  async activate(tenantId: string, id: string, manager?: EntityManager): Promise<Flow> {
    const flow = await this.update(tenantId, id, { isPublished: true }, manager);
    if (!manager) await this.resumeExecutions(tenantId, id);
    return flow;
  }

  async resumeExecutions(tenantId: string, id: string): Promise<void> {
    await this.workflowRepo.resumePublished(tenantId, id);
    await this.recoverDispatches();
  }

  deactivate(tenantId: string, id: string): Promise<Flow> {
    return this.update(tenantId, id, { isPublished: false });
  }

  async duplicate(tenantId: string, id: string): Promise<Flow> {
    const source = await this.findOne(tenantId, id);
    // An installation reference must not transfer its entitlement to an unrelated copy.
    const definition = { ...source.definition };
    delete definition.automation;
    return this.create(tenantId, {
      name: `${source.name} (Copy)`,
      type: source.type,
      definition,
      description: source.description,
      isPublished: false,
    });
  }

  async getExecution(tenantId: string, executionId: string): Promise<WorkflowExecution> {
    const execution = await this.workflowRepo.findExecutionById(tenantId, executionId);
    if (!execution) throw new NotFoundException('Execution not found');
    return execution;
  }

  getTriggerTypes() {
    return [
      { key: 'CONTACT_CREATED', label: 'Contact Created', category: 'CRM' },
      { key: 'CONTACT_UPDATED', label: 'Contact Updated', category: 'CRM' },
      { key: 'DEAL_CREATED', label: 'Deal Created', category: 'CRM' },
      { key: 'DEAL_STAGE_CHANGED', label: 'Deal Stage Changed', category: 'CRM' },
      { key: 'DEAL_WON', label: 'Deal Won', category: 'CRM' },
      { key: 'DEAL_LOST', label: 'Deal Lost', category: 'CRM' },
      { key: 'LEAD_CREATED', label: 'Lead Created', category: 'CRM' },
      { key: 'CALL_COMPLETED', label: 'Call Completed', category: 'Voice' },
      {
        key: 'WHATSAPP_MESSAGE_RECEIVED',
        label: 'WhatsApp Message Received',
        category: 'WhatsApp',
      },
      { key: 'CALL_DISPOSITIONED', label: 'Call Dispositioned', category: 'Voice' },
      { key: 'WHATSAPP_MESSAGE_DELIVERED', label: 'WhatsApp Delivered', category: 'WhatsApp' },
      { key: 'WHATSAPP_MESSAGE_READ', label: 'WhatsApp Read', category: 'WhatsApp' },
      { key: 'WHATSAPP_MESSAGE_FAILED', label: 'WhatsApp Failed', category: 'WhatsApp' },
      { key: 'MANUAL', label: 'Manual Trigger', category: 'Manual' },
    ];
  }

  getActionTypes() {
    return [
      { key: 'CREATE_CONTACT', label: 'Create Contact', category: 'CRM' },
      { key: 'UPDATE_CONTACT', label: 'Update Contact', category: 'CRM' },
      { key: 'CREATE_DEAL', label: 'Create Deal', category: 'CRM' },
      { key: 'UPDATE_DEAL', label: 'Update Deal', category: 'CRM' },
      { key: 'MOVE_PIPELINE_STAGE', label: 'Move Pipeline Stage', category: 'CRM' },
      { key: 'ASSIGN_OWNER', label: 'Assign Owner', category: 'CRM' },
      { key: 'ADD_TAG', label: 'Add Tag', category: 'CRM' },
      { key: 'CREATE_TASK', label: 'Create Task', category: 'CRM' },
      { key: 'CREATE_NOTE', label: 'Create Note', category: 'CRM' },
      { key: 'SEND_EMAIL', label: 'Send Email', category: 'Email' },
      { key: 'SEND_WHATSAPP', label: 'Send WhatsApp', category: 'WhatsApp' },
      { key: 'INITIATE_CALL', label: 'Initiate Voice Call', category: 'Voice' },
      { key: 'NOTIFY_TEAM', label: 'Notify Team', category: 'Notification' },
      { key: 'CALL_WEBHOOK', label: 'Call Webhook', category: 'Webhook' },
      { key: 'DELAY', label: 'Delay', category: 'Flow' },
      { key: 'WAIT_FOR_REPLY', label: 'Wait for WhatsApp reply', category: 'Flow' },
      { key: 'WAIT_UNTIL', label: 'Wait for condition', category: 'Flow' },
      { key: 'CONDITION_BRANCH', label: 'Condition Branch', category: 'Flow' },
      { key: 'LOG', label: 'Log Message', category: 'Flow' },
      { key: 'AI_CHAT', label: 'AI Chat', category: 'AI' },
      { key: 'SEND_TEMPLATE', label: 'Send WhatsApp Template', category: 'WhatsApp' },
      { key: 'ASSIGN_AGENT', label: 'Assign WhatsApp Agent', category: 'WhatsApp' },
      { key: 'RESOLVE', label: 'Resolve Conversation', category: 'WhatsApp' },
    ];
  }

  getExecutions(tenantId: string, flowId?: string): Promise<WorkflowExecution[]> {
    return this.workflowRepo.findExecutions(tenantId, flowId);
  }

  async getVersions(tenantId: string, flowId: string) {
    await this.findOne(tenantId, flowId);
    return this.workflowRepo.findVersions(tenantId, flowId);
  }

  async preview(tenantId: string, dto: WorkflowPreviewDto) {
    try {
      const plan = compileWorkflow(record(dto.definition, 'definition'));
      const payload = dto.payload ?? {};
      const context = { tenantId, eventName: 'PREVIEW', payload };
      for (const step of plan.steps)
        await this.policy.assertReferences(tenantId, step.config ?? {});
      const preview: Array<{
        stepId: string;
        type: string;
        config: Record<string, unknown>;
        passed?: boolean;
        wouldExecute: boolean;
      }> = [];
      let id = plan.startStepId;
      while (id) {
        const step = plan.steps.find((entry) => entry.id === id)!;
        let deferred = false;
        const deferOutputs = (value: unknown): unknown => {
          if (typeof value === 'string')
            return value.replace(
              /\{\{((?:steps|outputs)\.([^}.]+)\.[^}]+)\}\}/g,
              (_match, path: string, source: string) => {
                if (!preview.some((entry) => entry.stepId === source))
                  throw new BadRequestException(
                    `Output reference ${path} must refer to an earlier step`,
                  );
                deferred = true;
                return `[Available after execution: ${path}]`;
              },
            );
          if (Array.isArray(value)) return value.map(deferOutputs);
          if (value && typeof value === 'object')
            return Object.fromEntries(
              Object.entries(value).map(([key, entry]) => [key, deferOutputs(entry)]),
            );
          return value;
        };
        const config = resolveWorkflowConfig(
          deferOutputs(step.config ?? {}) as Record<string, unknown>,
          context,
        );
        validateStepConfig({ ...step, config });
        if (!deferred) await this.policy.assertReferences(tenantId, config, false);
        if (
          ['SEND_WHATSAPP', 'SEND_TEMPLATE'].includes(step.type) &&
          !String(config.toNumber ?? config.to ?? config.phone ?? payload.phone ?? '').trim()
        ) {
          throw new BadRequestException('Supply a preview recipient for the WhatsApp message');
        }
        const passed =
          step.type === 'CONDITION' ? this.executor.evaluateCondition(config, context) : undefined;
        preview.push({
          stepId: step.id,
          type: step.type,
          config: this.redactPreview(config),
          passed,
          wouldExecute: !deferred,
        });
        if (deferred && step.type === 'CONDITION') break;
        id =
          passed === false
            ? (step.falseStepId ?? null)
            : passed === true
              ? (step.trueStepId ?? step.nextStepId ?? null)
              : (step.nextStepId ?? null);
      }
      return {
        valid: true,
        errors: [] as string[],
        plan: {
          ...plan,
          steps: plan.steps.map((step) => ({
            ...step,
            config: this.redactPreview(step.config ?? {}),
          })),
        },
        preview,
        warnings: [
          'Preview uses trigger payload only; action outputs and AI decisions require execution. No actions were executed.',
        ],
      };
    } catch (error: unknown) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Invalid workflow'],
      };
    }
  }

  private redactPreview(value: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        /authorization|token|secret|password|api.?key/i.test(key)
          ? '[REDACTED]'
          : entry && typeof entry === 'object' && !Array.isArray(entry)
            ? this.redactPreview(record(entry))
            : entry,
      ]),
    );
  }

  async previewExisting(tenantId: string, id: string, payload: Record<string, unknown> = {}) {
    const flow = await this.findOne(tenantId, id);
    return this.preview(tenantId, { definition: flow.definition, payload });
  }

  async triggerWorkflow(
    tenantId: string,
    eventName: string,
    payload: Record<string, unknown>,
    workflowId?: string,
    eventId?: string,
    excludedFlowIds: string[] = [],
  ) {
    record(payload, 'payload');
    const depth = Number(payload.workflowDepth ?? 0);
    if (!Number.isFinite(depth) || depth > 8)
      throw new BadRequestException('Workflow event depth exceeded');
    const targets = workflowId
      ? [await this.findOne(tenantId, workflowId)]
      : await this.workflowRepo.findActiveByTrigger(tenantId, eventName);
    const jobIds: string[] = [];
    let triggered = 0;
    for (const flow of targets) {
      if (!flow.isPublished || excludedFlowIds.includes(flow.id)) continue;
      if (
        eventName.startsWith('WHATSAPP_') &&
        typeof flow.definition.phoneNumberId === 'string' &&
        flow.definition.phoneNumberId !== payload.phoneNumberId
      )
        continue;
      const plan = await this.validatePublication(tenantId, flow);
      await this.policy.assertFlow(tenantId, flow, 'execute');
      const version = await this.workflowRepo.snapshot(flow);
      const sourceId =
        eventId ?? (typeof payload.eventId === 'string' ? payload.eventId : undefined);
      const dedupeId = sourceId ? createHash('sha256').update(sourceId).digest('hex') : null;
      const { execution, created } = await this.workflowRepo.createOnce({
        tenantId,
        flowId: flow.id,
        status: 'QUEUED',
        versionId: version.id,
        definitionSnapshot: version.definition,
        eventId: dedupeId,
        input: { eventName, payload },
        output: { steps: [], variables: {} },
        currentStepId: plan.startStepId,
        dispatchGeneration: 0,
      });
      if (created) triggered += 1;
      if (!created && !['QUEUED', 'RUNNING'].includes(execution.status)) continue;
      try {
        jobIds.push(await this.enqueueExecution(execution));
      } catch (error: unknown) {
        this.logger.error(
          `Dispatch deferred for execution ${execution.id}: ${error instanceof Error ? error.message : 'queue unavailable'}`,
        );
        throw error; // emitAsync inbound dispatch must retry until every matching run is durably queued.
      }
    }
    return { success: true, triggered, jobIds };
  }

  async enqueueExecution(execution: WorkflowExecution): Promise<string> {
    const jobId = `workflow-${execution.id}-${execution.dispatchGeneration}`;
    const existing = await this.workflowQueue.getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (state === 'failed') await existing.retry();
      return jobId;
    }
    const job = await this.workflowQueue.add(
      JOB_NAMES.EXECUTE_WORKFLOW,
      {
        workflowId: execution.flowId,
        tenantId: execution.tenantId,
        eventName: execution.input.eventName ?? 'MANUAL',
        payload: execution.input.payload ?? {},
        executionId: execution.id,
        generation: execution.dispatchGeneration,
      },
      {
        jobId,
        delay: Math.max(0, (execution.resumeAt?.getTime() ?? 0) - Date.now()),
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
    return String(job.id);
  }

  @Interval(30000)
  async recoverDispatches(): Promise<void> {
    if (this.recovering) return;
    this.recovering = true;
    try {
      for (const execution of await this.workflowRepo.recoverable())
        await this.enqueueExecution(execution);
    } catch (error: unknown) {
      this.logger.warn(
        `Workflow dispatch recovery deferred: ${error instanceof Error ? error.message : 'unavailable'}`,
      );
    } finally {
      this.recovering = false;
    }
  }

  async retryExecution(tenantId: string, executionId: string) {
    const execution = await this.getExecution(tenantId, executionId);
    if (execution.status !== 'FAILED')
      throw new BadRequestException('Only failed executions can be retried');
    const flow = await this.findOne(tenantId, execution.flowId);
    if (!flow.isPublished) throw new BadRequestException('Publish workflow before retrying');
    await this.policy.assertFlow(tenantId, flow, 'execute');
    const retried = await this.workflowRepo.retry(tenantId, executionId);
    const jobId = await this.enqueueExecution(retried);
    return { success: true, jobId, executionId: retried.id };
  }

  async controlExecution(tenantId: string, id: string, action: 'pause' | 'resume' | 'cancel') {
    const current = await this.getExecution(tenantId, id);
    if (action === 'resume') {
      const flow = await this.findOne(tenantId, current.flowId);
      if (!flow.isPublished) throw new BadRequestException('Publish the workflow before resuming');
      await this.policy.assertFlow(tenantId, flow, 'execute');
    }
    const result = await this.workflowRepo.controlExecution(tenantId, id, action);
    if (action === 'resume') await this.enqueueExecution(result);
    return result;
  }
}
