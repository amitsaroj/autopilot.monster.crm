import { Test, TestingModule } from '@nestjs/testing';

import { WorkflowExecutorService } from './workflow-executor.service';
import { WorkflowActionExecutorService } from './workflow-action-executor.service';

describe('WorkflowExecutorService', () => {
  let service: WorkflowExecutorService;

  const mockActionExecutor = {
    executeAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowExecutorService,
        { provide: WorkflowActionExecutorService, useValue: mockActionExecutor },
      ],
    }).compile();

    service = module.get(WorkflowExecutorService);
    jest.clearAllMocks();
  });

  it('extracts linear steps from node graph', () => {
    const steps = service.extractSteps({
      nodes: [
        { id: 'trigger', data: { type: 'TRIGGER', isTrigger: true } },
        { id: 'step-1', data: { stepType: 'CREATE_TASK', label: 'Follow up' } },
        { id: 'step-2', data: { stepType: 'SEND_EMAIL', label: 'Notify' } },
      ],
      edges: [
        { source: 'trigger', target: 'step-1' },
        { source: 'step-1', target: 'step-2' },
      ],
    });

    expect(steps).toHaveLength(2);
    expect(steps[0].type).toBe('CREATE_TASK');
    expect(steps[1].type).toBe('SEND_EMAIL');
  });

  it('evaluates equals condition against payload', () => {
    const passed = service.evaluateCondition(
      { field: 'deal.status', operator: 'equals', value: 'WON' },
      {
        tenantId: 'tenant-1',
        eventName: 'DEAL_WON',
        payload: { deal: { status: 'WON' } },
      },
    );

    expect(passed).toBe(true);
  });

  it('evaluates not_contains and in operators', () => {
    expect(
      service.evaluateCondition(
        { field: 'contact.email', operator: 'not_contains', value: 'spam' },
        {
          tenantId: 'tenant-1',
          eventName: 'CONTACT_CREATED',
          payload: { contact: { email: 'user@example.com' } },
        },
      ),
    ).toBe(true);

    expect(
      service.evaluateCondition(
        { field: 'deal.stage', operator: 'in', value: ['WON', 'LOST'] },
        {
          tenantId: 'tenant-1',
          eventName: 'DEAL_STAGE_CHANGED',
          payload: { deal: { stage: 'WON' } },
        },
      ),
    ).toBe(true);
  });

  it('executes LOG step without delegating to action executor', async () => {
    const result = await service.executeStep(
      { id: 'log-1', type: 'LOG', config: { message: 'hello' } },
      { tenantId: 'tenant-1', eventName: 'MANUAL', payload: {} },
    );

    expect(result.status).toBe('COMPLETED');
    expect(result.logged).toBe(true);
    expect(mockActionExecutor.executeAction).not.toHaveBeenCalled();
  });

  it('delegates CREATE_TASK to action executor', async () => {
    mockActionExecutor.executeAction.mockResolvedValue({
      stepId: 'task-1',
      type: 'CREATE_TASK',
      status: 'COMPLETED',
      taskId: 'task-id',
    });

    const result = await service.executeStep(
      { id: 'task-1', type: 'CREATE_TASK', config: { title: 'Call lead' } },
      { tenantId: 'tenant-1', eventName: 'LEAD_CREATED', payload: {} },
    );

    expect(mockActionExecutor.executeAction).toHaveBeenCalled();
    expect(result.status).toBe('COMPLETED');
    expect(result.taskId).toBe('task-id');
  });
});
