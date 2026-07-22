import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { WorkflowProcessor } from './workflow.processor';
import { WorkflowRepository } from './workflow.repository';
import { WorkflowExecutorService } from './workflow-executor.service';

describe('WorkflowProcessor', () => {
  let processor: WorkflowProcessor;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-2' }),
  };

  const mockWorkflowRepo = {
    findById: jest.fn(),
    findExecutionById: jest.fn(),
    createExecution: jest.fn(),
    updateExecution: jest.fn(),
  };

  const mockExecutor = {
    extractSteps: jest.fn(),
    executeStep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowProcessor,
        { provide: getQueueToken(QUEUE_NAMES.WORKFLOW), useValue: mockQueue },
        { provide: WorkflowRepository, useValue: mockWorkflowRepo },
        { provide: WorkflowExecutorService, useValue: mockExecutor },
      ],
    }).compile();

    processor = module.get(WorkflowProcessor);
    jest.resetAllMocks();
    mockQueue.add.mockResolvedValue({ id: 'job-2' });
  });

  it('completes a published workflow and records execution output', async () => {
    mockWorkflowRepo.findById.mockResolvedValue({
      id: 'flow-1',
      isPublished: true,
      definition: { steps: [{ id: 'log-1', type: 'LOG' }] },
    });
    mockWorkflowRepo.findExecutionById.mockResolvedValue({
      id: 'exec-1',
      status: 'RUNNING',
      output: { steps: [] },
    });
    mockExecutor.extractSteps.mockReturnValue([{ id: 'log-1', type: 'LOG' }]);
    mockExecutor.executeStep.mockResolvedValue({
      stepId: 'log-1',
      type: 'LOG',
      status: 'COMPLETED',
      logged: true,
    });

    const result = await processor.handleExecuteWorkflow({
      id: 'job-1',
      data: {
        workflowId: 'flow-1',
        tenantId: 'tenant-1',
        eventName: 'CONTACT_CREATED',
        payload: { contactId: 'c-1' },
        executionId: 'exec-1',
      },
    } as never);

    expect(result.status).toBe('COMPLETED');
    expect(mockWorkflowRepo.updateExecution).toHaveBeenCalledWith(
      'tenant-1',
      'exec-1',
      expect.objectContaining({ status: 'COMPLETED' }),
    );
  });

  it('schedules delayed resume when a step returns SCHEDULED', async () => {
    mockWorkflowRepo.findById.mockResolvedValue({
      id: 'flow-1',
      isPublished: true,
      definition: { steps: [] },
    });
    mockWorkflowRepo.findExecutionById.mockResolvedValue({
      id: 'exec-1',
      status: 'RUNNING',
      output: { steps: [] },
    });
    mockExecutor.extractSteps.mockReturnValue([
      { id: 'delay-1', type: 'DELAY' },
      { id: 'log-1', type: 'LOG' },
    ]);
    mockExecutor.executeStep
      .mockResolvedValueOnce({
        stepId: 'delay-1',
        type: 'DELAY',
        status: 'SCHEDULED',
        delayMs: 60000,
      })
      .mockResolvedValueOnce({
        stepId: 'log-1',
        type: 'LOG',
        status: 'COMPLETED',
      });

    const result = await processor.handleExecuteWorkflow({
      id: 'job-1',
      data: {
        workflowId: 'flow-1',
        tenantId: 'tenant-1',
        eventName: 'MANUAL',
        payload: {},
        executionId: 'exec-1',
        startStepIndex: 0,
      },
    } as never);

    expect(result.status).toBe('SCHEDULED');
    expect(mockQueue.add).toHaveBeenCalledWith(
      JOB_NAMES.EXECUTE_WORKFLOW,
      expect.objectContaining({ startStepIndex: 1 }),
      expect.objectContaining({ delay: 60000 }),
    );
    expect(mockWorkflowRepo.updateExecution).toHaveBeenCalledWith(
      'tenant-1',
      'exec-1',
      expect.objectContaining({ status: 'PAUSED' }),
    );
  });

  it('marks execution failed and rethrows on step error', async () => {
    mockWorkflowRepo.findById.mockResolvedValue({
      id: 'flow-1',
      isPublished: true,
      definition: { steps: [] },
    });
    mockWorkflowRepo.findExecutionById.mockResolvedValue({
      id: 'exec-1',
      status: 'RUNNING',
      output: { steps: [] },
    });
    mockExecutor.extractSteps.mockReturnValue([{ id: 'task-1', type: 'CREATE_TASK' }]);
    mockExecutor.executeStep.mockRejectedValue(new Error('Task creation failed'));

    await expect(
      processor.handleExecuteWorkflow({
        id: 'job-1',
        data: {
          workflowId: 'flow-1',
          tenantId: 'tenant-1',
          eventName: 'LEAD_CREATED',
          payload: {},
          executionId: 'exec-1',
        },
      } as never),
    ).rejects.toThrow('Task creation failed');

    expect(mockWorkflowRepo.updateExecution).toHaveBeenCalledWith(
      'tenant-1',
      'exec-1',
      expect.objectContaining({ status: 'FAILED', error: 'Task creation failed' }),
    );
  });
});
