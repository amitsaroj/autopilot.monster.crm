import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WorkflowRepository } from './workflow.repository';
import { CreateWorkflowDto } from './dto/workflow.dto';
import { Flow } from '../../database/entities/flow.entity';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectQueue('workflows') private readonly workflowQueue: Queue,
    private readonly workflowRepo: WorkflowRepository,
  ) {}

  async findAll(tenantId: string): Promise<Flow[]> {
    return this.workflowRepo.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Flow> {
    const flow = await this.workflowRepo.findById(tenantId, id);
    if (!flow) throw new NotFoundException('Workflow not found');
    return flow;
  }

  async create(tenantId: string, dto: CreateWorkflowDto): Promise<Flow> {
    return this.workflowRepo.create(tenantId, dto);
  }

  async update(tenantId: string, id: string, dto: Partial<CreateWorkflowDto>): Promise<Flow> {
    await this.findOne(tenantId, id);
    return this.workflowRepo.updateWithTenant(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.workflowRepo.delete(tenantId, id);
  }

  async getExecutions(tenantId: string) {
    return this.workflowRepo.findExecutions(tenantId);
  }

  /**
   * Triggers an automation workflow based on system events
   */
  async triggerWorkflow(tenantId: string, eventName: string, payload: any) {
    this.logger.log(`Triggering workflow for event: ${eventName} (Tenant: ${tenantId})`);

    // Fetch active workflows for this tenant
    const activeFlows = await this.workflowRepo.findActive(tenantId);

    // Simple matching: in a real system we'd parse the 'definition' JSON 
    // to find trigger nodes that match `eventName`. Here we do a basic check
    // to see if the eventName string exists in the JSON stringified definition.
    const matchedFlows = activeFlows.filter((flow: any) => {
      try {
        const defStr = JSON.stringify(flow.definition);
        return defStr.includes(`"event":"${eventName}"`) || defStr.includes(`"trigger":"${eventName}"`);
      } catch {
        return false;
      }
    });

    if (matchedFlows.length === 0) {
      this.logger.log(`No active workflows matched event: ${eventName}`);
      return { success: true, executed: 0 };
    }

    this.logger.log(`Found ${matchedFlows.length} matching workflow(s) for event: ${eventName}`);

    for (const flow of matchedFlows) {
      const executionId = 'exec_' + Math.random().toString(36).substring(7);

      await this.workflowQueue.add(
        'execute-workflow',
        {
          workflowId: flow.id,
          executionId,
          tenantId,
          eventName,
          payload,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
        },
      );
    }

    return { success: true, executed: matchedFlows.length };
  }
}
