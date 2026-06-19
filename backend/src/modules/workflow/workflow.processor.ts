import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { WorkflowRepository } from './workflow.repository';
import { WorkflowExecutorService, WorkflowStepResult } from './workflow-executor.service';

interface WorkflowJobData {
  workflowId: string;
  tenantId: string;
  eventName: string;
  payload: Record<string, unknown>;
  executionId?: string;
  startStepIndex?: number;
}

@Processor('workflows')
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(
    @InjectQueue('workflows') private readonly workflowQueue: Queue,
    private readonly workflowRepo: WorkflowRepository,
    private readonly executor: WorkflowExecutorService,
  ) {
    super();
  }

  async process(job: Job<WorkflowJobData, { status: string }>): Promise<{ status: string }> {
    const { workflowId, tenantId, eventName, payload, executionId, startStepIndex = 0 } = job.data;
    this.logger.log(`Executing workflow job ${job.id} (${workflowId}) for event: ${eventName}`);

    const flow = await this.workflowRepo.findById(tenantId, workflowId);
    if (!flow) {
      throw new Error(`Workflow ${workflowId} not found for tenant ${tenantId}`);
    }

    if (!flow.isPublished) {
      this.logger.warn(`Workflow ${workflowId} is not published — skipping`);
      return { status: 'SKIPPED' };
    }

    const execution =
      executionId !== undefined
        ? await this.workflowRepo.findExecutionById(tenantId, executionId)
        : await this.workflowRepo.createExecution({
            tenantId,
            flowId: workflowId,
            status: 'RUNNING',
            input: { eventName, payload },
            output: { steps: [] },
          });

    const steps = this.executor.extractSteps(flow.definition ?? {});
    const priorSteps: WorkflowStepResult[] =
      execution?.output &&
      typeof execution.output === 'object' &&
      Array.isArray((execution.output as { steps?: unknown }).steps)
        ? ((execution.output as { steps: WorkflowStepResult[] }).steps ?? [])
        : [];
    const stepResults: WorkflowStepResult[] = [...priorSteps];

    if (execution && execution.status === 'PAUSED') {
      await this.workflowRepo.updateExecution(tenantId, execution.id, {
        status: 'RUNNING',
      });
    }

    try {
      for (let index = startStepIndex; index < steps.length; index += 1) {
        const step = steps[index];

        if (step.type === 'CONDITION' || step.type === 'CONDITION_BRANCH') {
          const result = await this.executor.executeStep(step, { tenantId, eventName, payload });
          stepResults.push(result);
          if (result.passed === false) {
            this.logger.debug(`Condition failed at step ${step.id} — halting workflow`);
            break;
          }
          continue;
        }

        const result = await this.executor.executeStep(step, { tenantId, eventName, payload });
        stepResults.push(result);

        if (result.status === 'SCHEDULED' && typeof result.delayMs === 'number') {
          if (execution) {
            await this.workflowRepo.updateExecution(tenantId, execution.id, {
              status: 'PAUSED',
              currentStepId: step.id,
              output: { steps: stepResults },
            });
          }

          await this.workflowQueue.add(
            'execute-workflow',
            {
              workflowId,
              tenantId,
              eventName,
              payload,
              executionId: execution?.id,
              startStepIndex: index + 1,
            },
            {
              delay: result.delayMs,
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            },
          );

          this.logger.log(
            `Workflow ${workflowId} scheduled to resume in ${result.delayMs}ms at step ${index + 1}`,
          );
          return { status: 'SCHEDULED' };
        }
      }

      if (execution) {
        await this.workflowRepo.updateExecution(tenantId, execution.id, {
          status: 'COMPLETED',
          completedAt: new Date(),
          output: { steps: stepResults },
        });
      }

      this.logger.log(`Workflow ${workflowId} completed (${stepResults.length} steps)`);
      return { status: 'COMPLETED' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown workflow error';
      if (execution) {
        await this.workflowRepo.updateExecution(tenantId, execution.id, {
          status: 'FAILED',
          completedAt: new Date(),
          error: message,
          output: { steps: stepResults },
        });
      }
      this.logger.error(`Workflow ${workflowId} failed: ${message}`);
      throw err;
    }
  }
}
