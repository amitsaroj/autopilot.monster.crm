import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowProcessor } from './workflow.processor';
import { WorkflowRepository } from './workflow.repository';
import { WorkflowExecutorService } from './workflow-executor.service';
import { WorkflowService } from './workflow.service';
import { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';
import { WorkflowSequenceService } from './workflow-sequence.service';

describe('WorkflowProcessor', () => {
  let processor: WorkflowProcessor;
  const repository = {
    findById: jest.fn(),
    claim: jest.fn(),
    checkpoint: jest.fn(),
    heartbeat: jest.fn(),
  };
  const executor = { executeStep: jest.fn() };
  const workflows = { enqueueExecution: jest.fn() };
  const policy = { assertFlow: jest.fn() };
  const job = {
    id: 'job-1',
    attemptsMade: 0,
    opts: { attempts: 1 },
    data: {
      workflowId: 'flow-1',
      tenantId: 'tenant-1',
      eventName: 'MANUAL',
      payload: {},
      executionId: 'exec-1',
      generation: 0,
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        WorkflowProcessor,
        { provide: WorkflowRepository, useValue: repository },
        { provide: WorkflowExecutorService, useValue: executor },
        { provide: WorkflowService, useValue: workflows },
        { provide: WorkflowRuntimePolicyService, useValue: policy },
        { provide: WorkflowSequenceService, useValue: { inspect: jest.fn(), wait: jest.fn() } },
        { provide: EventEmitter2, useValue: { emitAsync: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();
    processor = module.get(WorkflowProcessor);
    repository.findById.mockResolvedValue({ id: 'flow-1', isPublished: true });
    repository.checkpoint.mockResolvedValue(undefined);
  });

  it('completes a published workflow and records execution output', async () => {
    repository.claim.mockResolvedValue({
      id: 'exec-1',
      dispatchGeneration: 0,
      startedAt: new Date(),
      definitionSnapshot: { steps: [{ id: 'log-1', type: 'LOG' }] },
      output: { steps: [] },
      input: { payload: {} },
    });
    executor.executeStep.mockResolvedValue({
      stepId: 'log-1',
      type: 'LOG',
      status: 'COMPLETED',
      logged: true,
    });
    const result = await processor.handleExecuteWorkflow(job as never);
    expect(result.status).toBe('COMPLETED');
    expect(repository.checkpoint).toHaveBeenCalledWith(
      'tenant-1',
      'exec-1',
      expect.any(String),
      expect.objectContaining({ status: 'COMPLETED', currentStepId: null }),
    );
  });

  it('schedules delayed resume when a step returns SCHEDULED', async () => {
    repository.claim.mockResolvedValue({
      id: 'exec-1',
      dispatchGeneration: 0,
      startedAt: new Date(),
      definitionSnapshot: {
        steps: [
          { id: 'delay-1', type: 'DELAY', config: { delayMinutes: 1 } },
          { id: 'log-1', type: 'LOG' },
        ],
      },
      output: { steps: [] },
      input: { payload: {} },
    });
    executor.executeStep.mockResolvedValue({
      stepId: 'delay-1',
      type: 'DELAY',
      status: 'SCHEDULED',
      delayMs: 60000,
    });
    const result = await processor.handleExecuteWorkflow(job as never);
    expect(result.status).toBe('SCHEDULED');
    expect(workflows.enqueueExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        currentStepId: 'log-1',
        dispatchGeneration: 1,
        resumeAt: expect.any(Date),
        status: 'PAUSED',
        pauseReason: 'delay',
      }),
    );
    expect(repository.checkpoint).toHaveBeenCalledWith(
      'tenant-1',
      'exec-1',
      expect.any(String),
      expect.objectContaining({ status: 'PAUSED', currentStepId: 'log-1' }),
    );
    expect(executor.executeStep).toHaveBeenCalledTimes(1);
  });

  it('marks execution failed and rethrows on step error', async () => {
    repository.claim.mockResolvedValue({
      id: 'exec-1',
      dispatchGeneration: 0,
      startedAt: new Date(),
      definitionSnapshot: { steps: [{ id: 'task-1', type: 'CREATE_TASK' }] },
      output: { steps: [] },
      input: { payload: {} },
    });
    executor.executeStep.mockRejectedValue(new Error('Task creation failed'));
    await expect(processor.handleExecuteWorkflow(job as never)).rejects.toThrow(
      'Task creation failed',
    );
    expect(repository.checkpoint).toHaveBeenCalledWith(
      'tenant-1',
      'exec-1',
      expect.any(String),
      expect.objectContaining({ status: 'FAILED', error: 'Task creation failed' }),
    );
  });
});
