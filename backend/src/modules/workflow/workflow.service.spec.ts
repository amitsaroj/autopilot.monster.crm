import type { Queue } from 'bull';

import type { Flow } from '../../database/entities/flow.entity';
import { WorkflowService } from './workflow.service';
import type { WorkflowRepository } from './workflow.repository';
import type { WorkflowExecutorService } from './workflow-executor.service';
import type { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';
import type { ShopifyIntegrationService } from '../commerce/shopify-integration.service';

const flow = (id: string, definition: Record<string, unknown>) =>
  ({ id, tenantId: 'tenant-1', isPublished: true, definition }) as unknown as Flow;

describe('WorkflowService.triggerWorkflow', () => {
  const valid = { steps: [{ id: 'log', type: 'LOG', config: { message: 'hi' } }] };
  const invalid = { steps: [{ id: 'bad', type: 'NOT_A_REAL_ACTION' }] };

  const setup = (flows: Flow[]) => {
    const repo = {
      findActiveByTrigger: jest.fn().mockResolvedValue(flows),
      findById: jest.fn(async (_tenantId: string, id: string) => flows.find((f) => f.id === id)),
      snapshot: jest.fn(async (f: Flow) => ({ id: `v-${f.id}`, definition: f.definition })),
      createOnce: jest.fn(async (data: { flowId: string }) => ({
        execution: { id: `e-${data.flowId}`, status: 'QUEUED', dispatchGeneration: 0, input: {} },
        created: true,
      })),
    };
    const queue = {
      getJob: jest.fn().mockResolvedValue(null),
      add: jest.fn(async (_name: string, _data: unknown, opts: { jobId: string }) => ({
        id: opts.jobId,
      })),
    };
    const policy = { assertFlow: jest.fn(), assertReferences: jest.fn() };
    const service = new WorkflowService(
      queue as unknown as Queue,
      repo as unknown as WorkflowRepository,
      {} as WorkflowExecutorService,
      policy as unknown as WorkflowRuntimePolicyService,
      {} as ShopifyIntegrationService,
    );
    return { service, repo };
  };

  it('skips an invalid flow and still dispatches the remaining flows', async () => {
    const { service, repo } = setup([flow('a', invalid), flow('b', valid), flow('c', valid)]);
    const result = await service.triggerWorkflow('tenant-1', 'LEAD_CREATED', {});
    expect(result.triggered).toBe(2);
    expect(repo.createOnce.mock.calls.map(([data]) => data.flowId)).toEqual(['b', 'c']);
  });

  it('still surfaces the error when a specific workflow is targeted', async () => {
    const { service } = setup([flow('a', invalid)]);
    await expect(service.triggerWorkflow('tenant-1', 'MANUAL', {}, 'a')).rejects.toThrow(
      /Unsupported action type/,
    );
  });
});
