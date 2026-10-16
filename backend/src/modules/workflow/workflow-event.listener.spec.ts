import type { Lead } from '../../database/entities/lead.entity';
import { WorkflowEventListener } from './workflow-event.listener';
import type { WorkflowService } from './workflow.service';
import type { WorkflowRepository } from './workflow.repository';

describe('WorkflowEventListener LEAD_CREATED', () => {
  it('triggers LEAD_CREATED workflows with a lead-scoped dedupe eventId', async () => {
    const triggerWorkflow = jest.fn().mockResolvedValue({ triggered: 1, jobIds: [] });
    const listener = new WorkflowEventListener(
      { triggerWorkflow } as unknown as WorkflowService,
      {} as WorkflowRepository,
    );
    const lead = { id: 'lead-1', firstName: 'Ann' } as unknown as Lead;

    await listener.handleLeadCreated({ lead, tenantId: 'tenant-1' });

    expect(triggerWorkflow).toHaveBeenCalledWith('tenant-1', 'LEAD_CREATED', {
      leadId: 'lead-1',
      lead,
      eventId: 'lead.created:lead-1',
    });
  });
});
