import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(@InjectQueue('workflows') private readonly workflowQueue: Queue) {}

  /**
   * Triggers an automation workflow based on system events
   */
  async triggerWorkflow(tenantId: string, eventName: string, payload: any) {
    this.logger.log(`Triggering workflow for event: ${eventName} (Tenant: ${tenantId})`);
    
    // In production, fetch active workflows attached to this event from the DB
    // e.g., const workflows = await this.db.workflows.find({ tenantId, trigger: eventName, active: true })
    
    // Mock scheduling the execution
    const workflowId = 'wkf_' + Math.random().toString(36).substring(7);
    
    const job = await this.workflowQueue.add(
      'execute-workflow',
      {
         workflowId,
         tenantId,
         eventName,
         payload,
      },
      {
         attempts: 3,
         backoff: { type: 'exponential', delay: 5000 },
      }
    );

    return { success: true, jobId: job.id };
  }
}
