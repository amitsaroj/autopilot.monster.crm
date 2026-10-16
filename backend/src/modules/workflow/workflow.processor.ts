import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { Job } from 'bull';
import { randomUUID, createHash } from 'crypto';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { WorkflowRepository } from './workflow.repository';
import { WorkflowExecutorService, WorkflowStepResult } from './workflow-executor.service';
import { WorkflowService } from './workflow.service';
import { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';
import { compileWorkflow, WorkflowStep, sequencePolicy } from './workflow-definition';
import {
  WorkflowSequenceService,
  businessHoursForRecipient,
  nextBusinessOpening,
} from './workflow-sequence.service';
import { resolveWorkflowConfig } from './workflow-template.util';
import { workflowCausation } from './workflow-causation';

export interface WorkflowJobData {
  workflowId: string;
  tenantId: string;
  eventName: string;
  payload: Record<string, unknown>;
  executionId?: string;
  startStepIndex?: number;
  generation?: number;
}

/**
 * Jobs per worker process. Safe above 1: `claim` is an atomic lease UPDATE and every
 * checkpoint is fenced by the lease token, so one execution never runs twice at once.
 */
export const WORKFLOW_WORKER_CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env['WORKFLOW_WORKER_CONCURRENCY'] ?? '5', 10) || 5,
);

export function workflowStepKey(executionId: string, stepId: string): string {
  return `wf-${executionId}-${createHash('sha256').update(stepId).digest('hex').slice(0, 32)}`;
}

@Processor(QUEUE_NAMES.WORKFLOW)
export class WorkflowProcessor {
  private readonly logger = new Logger(WorkflowProcessor.name);
  private dispatchingLifecycleEvents = false;

  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly executor: WorkflowExecutorService,
    private readonly workflowService: WorkflowService,
    private readonly policy: WorkflowRuntimePolicyService,
    private readonly sequences: WorkflowSequenceService,
    private readonly events: EventEmitter2,
  ) {}

  @Interval(5000)
  async dispatchLifecycleEvents(): Promise<void> {
    if (this.dispatchingLifecycleEvents) return;
    this.dispatchingLifecycleEvents = true;
    try {
      const events = await this.workflowRepo.claimLifecycleEvents(50);
      for (const event of events) {
        try {
          await this.events.emitAsync(event.event, event.payload);
          await this.workflowRepo.markLifecycleEventDelivered(event.id);
        } catch {
          await this.workflowRepo.retryLifecycleEvent(event.id);
          this.logger.warn(`Workflow lifecycle event ${event.id} will be retried`);
        }
      }
    } catch {
      this.logger.warn('Workflow lifecycle outbox scan deferred');
    } finally {
      this.dispatchingLifecycleEvents = false;
    }
  }

  @Process({ name: JOB_NAMES.EXECUTE_WORKFLOW, concurrency: WORKFLOW_WORKER_CONCURRENCY })
  async handleExecuteWorkflow(job: Job<WorkflowJobData>): Promise<{ status: string }> {
    const { tenantId, workflowId } = job.data;
    let executionId = job.data.executionId;
    // Compatibility for already queued legacy jobs: persist their identity before running.
    if (!executionId) {
      const flow = await this.workflowRepo.findById(tenantId, workflowId);
      if (!flow) throw new Error('Workflow not found');
      const plan = compileWorkflow(flow.definition);
      const version = await this.workflowRepo.snapshot(flow);
      const created = await this.workflowRepo.createOnce({
        tenantId,
        flowId: workflowId,
        status: 'QUEUED',
        versionId: version.id,
        definitionSnapshot: version.definition,
        eventId: `legacy-job-${job.id}`,
        input: { eventName: job.data.eventName, payload: job.data.payload },
        output: { steps: [] },
        currentStepId: plan.steps[job.data.startStepIndex ?? 0]?.id ?? plan.startStepId,
        dispatchGeneration: 0,
      });
      executionId = created.execution.id;
      await job.update({ ...job.data, executionId, generation: 0 });
    }
    const token = randomUUID();
    const execution = await this.workflowRepo.claim(
      tenantId,
      executionId,
      job.data.generation ?? 0,
      token,
    );
    if (!execution) return { status: 'SKIPPED' };
    let lostLease = false;
    const heartbeat = setInterval(() => {
      void this.workflowRepo.heartbeat(tenantId, execution.id, token).catch(() => {
        lostLease = true;
      });
    }, 15000);
    const results: WorkflowStepResult[] = [...(execution.output?.steps ?? [])];
    const variables = { ...(execution.output?.variables ?? {}) };
    let sideEffectStarted = false;
    const save = (data: Parameters<WorkflowRepository['checkpoint']>[3]) =>
      this.workflowRepo.checkpoint(tenantId, execution.id, token, data);
    try {
      const snapshot = execution.definitionSnapshot;
      if (!snapshot) throw new Error('Legacy execution has no pinned definition; recreate the run');
      const plan = compileWorkflow(snapshot);
      let cursor =
        execution.currentStepId === undefined ? plan.startStepId : execution.currentStepId;
      while (cursor) {
        if (lostLease) throw new Error('Workflow lease heartbeat failed');
        const flow = await this.workflowRepo.findById(tenantId, workflowId);
        if (!flow || !flow.isPublished) {
          await save({
            status: 'PAUSED',
            pauseReason: 'unpublished',
            leaseToken: null,
            leaseExpiresAt: null,
          });
          return { status: 'PAUSED' };
        }
        try {
          await this.policy.assertFlow(tenantId, flow, 'execute');
        } catch (error: unknown) {
          await save({
            status: 'PAUSED',
            pauseReason: 'entitlement',
            error: error instanceof Error ? error.message : 'Entitlement unavailable',
            leaseToken: null,
            leaseExpiresAt: null,
          });
          return { status: 'PAUSED' };
        }
        const inspected =
          flow.type === 'whatsapp' || snapshot.sequence !== undefined
            ? await this.sequences.inspect(execution)
            : { payload: execution.input.payload ?? job.data.payload, stopReason: null };
        const sequence = sequencePolicy(snapshot.sequence);
        const context = {
          tenantId,
          eventName: execution.input.eventName ?? job.data.eventName,
          payload: inspected.payload,
          executionId: execution.id,
          versionId: execution.versionId ?? undefined,
          outputs: variables,
          now: execution.startedAt.toISOString(),
        };
        const goalReached =
          sequence.exitCondition &&
          this.executor.evaluateCondition(
            resolveWorkflowConfig(sequence.exitCondition, context),
            context,
          );
        if (inspected.stopReason || goalReached) {
          await save({
            status: 'CANCELLED',
            completedAt: new Date(),
            currentStepId: null,
            pauseReason: inspected.stopReason ?? 'GOAL_REACHED',
            output: { steps: results, variables },
            leaseToken: null,
            leaseExpiresAt: null,
          });
          return { status: 'CANCELLED' };
        }
        const step = plan.steps.find((entry) => entry.id === cursor);
        if (!step) throw new Error(`Pinned workflow step ${cursor} is missing`);
        const prior = results.find((result) => result.stepId === step.id);
        if (
          prior?.status === 'COMPLETED' ||
          (prior?.status === 'SCHEDULED' && step.type === 'DELAY')
        ) {
          cursor = prior.nextStepId ?? this.nextStep(step, prior);
          await save({ currentStepId: cursor });
          continue;
        }
        const hours = sequence.businessHours
          ? businessHoursForRecipient(sequence.businessHours, inspected.payload)
          : undefined;
        const opening =
          hours && ['SEND_WHATSAPP', 'SEND_TEMPLATE'].includes(step.type)
            ? nextBusinessOpening(hours, new Date())
            : null;
        if (opening) {
          const generation = execution.dispatchGeneration + 1;
          await save({
            status: 'PAUSED',
            pauseReason: 'delay',
            resumeAt: opening,
            dispatchGeneration: generation,
            output: { steps: results, variables },
            leaseToken: null,
            leaseExpiresAt: null,
          });
          try {
            await this.workflowService.enqueueExecution({
              ...execution,
              dispatchGeneration: generation,
              resumeAt: opening,
              status: 'PAUSED',
              pauseReason: 'delay',
            });
          } catch (error: unknown) {
            this.logger.warn(
              `Business-hours dispatch deferred: ${error instanceof Error ? error.message : 'queue unavailable'}`,
            );
          }
          return { status: 'SCHEDULED' };
        }
        const repeatSafe = [
          'CREATE_LEAD',
          'SEND_WHATSAPP',
          'SEND_TEMPLATE',
          'LOG',
          'END',
          'CONDITION',
          'DELAY',
          'WAIT_FOR_REPLY',
          'WAIT_UNTIL',
        ].includes(step.type);
        if (prior?.status === 'STARTED' && !repeatSafe) {
          throw new Error(
            `Step ${step.id} has an uncertain outcome; reconcile its side effect before retrying`,
          );
        }
        const idempotencyKey = workflowStepKey(execution.id, step.id);
        const marker: WorkflowStepResult = {
          stepId: step.id,
          type: step.type,
          status: 'STARTED',
          idempotencyKey,
          startedAt: prior?.startedAt ?? new Date().toISOString(),
        };
        const index = results.findIndex((result) => result.stepId === step.id);
        if (index >= 0) results[index] = marker;
        else results.push(marker);
        await save({
          currentStepId: step.id,
          output: { steps: results, variables },
          pauseReason: null,
          resumeAt: null,
        });
        sideEffectStarted = true;
        const isWait = ['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(step.type);
        const waitConfig = isWait ? resolveWorkflowConfig(step.config ?? {}, context) : {};
        if (isWait) await this.policy.assertAction(tenantId, step, waitConfig);
        const result = isWait
          ? await this.sequences.wait(
              step,
              waitConfig,
              execution,
              marker.startedAt!,
              inspected.payload,
              step.type === 'WAIT_UNTIL'
                ? this.executor.evaluateCondition(waitConfig, context)
                : undefined,
            )
          : await workflowCausation.run(
              {
                flowId: workflowId,
                executionId: execution.id,
                depth: Number(execution.input.payload?.workflowDepth ?? 0) + 1,
              },
              () => this.executor.executeStep(step, { ...context, idempotencyKey }),
            );
        result.idempotencyKey = idempotencyKey;
        result.startedAt = marker.startedAt;
        result.completedAt = new Date().toISOString();
        result.nextStepId = this.nextStep(step, result);
        const position = results.findIndex((entry) => entry.stepId === step.id);
        results[position] = result;
        variables[step.id] = { ...result, ...(result.output ?? {}) };
        cursor = result.nextStepId;
        if (result.status === 'SCHEDULED') {
          const generation = execution.dispatchGeneration + 1;
          const resumeAt = new Date(Date.now() + (result.delayMs ?? 0));
          await save({
            status: 'PAUSED',
            pauseReason: 'delay',
            currentStepId: cursor,
            resumeAt,
            output: { steps: results, variables },
            dispatchGeneration: generation,
            leaseToken: null,
            leaseExpiresAt: null,
          });
          sideEffectStarted = false;
          try {
            await this.workflowService.enqueueExecution({
              ...execution,
              dispatchGeneration: generation,
              resumeAt,
              currentStepId: cursor,
              output: { steps: results, variables },
              status: 'PAUSED',
              pauseReason: 'delay',
            });
          } catch (error: unknown) {
            // Durable resumeAt + recovery scan recreate this exact job after Redis recovers.
            this.logger.warn(
              `Delayed dispatch deferred: ${error instanceof Error ? error.message : 'queue unavailable'}`,
            );
          }
          return { status: 'SCHEDULED' };
        }
        await save({ currentStepId: cursor, output: { steps: results, variables } });
        sideEffectStarted = false;
      }
      await save({
        status: 'COMPLETED',
        completedAt: new Date(),
        currentStepId: null,
        output: { steps: results, variables },
        error: null,
        pauseReason: null,
        resumeAt: null,
        leaseToken: null,
        leaseExpiresAt: null,
      });
      return { status: 'COMPLETED' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown workflow error';
      const terminal =
        job.attemptsMade + 1 >= (job.opts.attempts ?? 1) || message.includes('uncertain outcome');
      // Never rewrite a successful but uncheckpointed action into a retryable failure.
      await save({
        status: terminal ? 'FAILED' : 'QUEUED',
        error: message,
        completedAt: terminal ? new Date() : null,
        ...(sideEffectStarted ? {} : { output: { steps: results, variables } }),
        leaseToken: null,
        leaseExpiresAt: null,
      }).catch((checkpointError: unknown) => {
        this.logger.error(
          `Failure checkpoint unavailable: ${checkpointError instanceof Error ? checkpointError.message : 'database unavailable'}`,
        );
      });
      throw error;
    } finally {
      clearInterval(heartbeat);
    }
  }

  private nextStep(step: WorkflowStep, result: WorkflowStepResult): string | null {
    if (['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(step.type)) {
      if (result.status === 'SCHEDULED') return step.id;
      if (result.reason === 'WAIT_TIMEOUT') return step.fallbackStepId ?? null;
    }
    if (step.type === 'END') return null;
    if (step.type === 'CONDITION')
      return result.passed
        ? (step.trueStepId ?? step.nextStepId ?? null)
        : (step.falseStepId ?? null);
    if (step.type === 'AI_CHAT' && result.handoff) return step.fallbackStepId ?? null;
    return step.nextStepId ?? null;
  }
}
