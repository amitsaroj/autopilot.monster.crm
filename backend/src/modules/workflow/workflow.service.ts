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

  async activate(tenantId: string, id: string): Promise<Flow> {
    await this.findOne(tenantId, id);
    return this.workflowRepo.updateWithTenant(tenantId, id, { isPublished: true });
  }

  async deactivate(tenantId: string, id: string): Promise<Flow> {
    await this.findOne(tenantId, id);
    return this.workflowRepo.updateWithTenant(tenantId, id, { isPublished: false });
  }

  async duplicate(tenantId: string, id: string): Promise<Flow> {
    const source = await this.findOne(tenantId, id);
    return this.workflowRepo.create(tenantId, {
      name: `${source.name} (Copy)`,
      type: source.type,
      definition: source.definition,
      description: source.description,
      isPublished: false,
    });
  }

  async getExecution(tenantId: string, executionId: string) {
    const execution = await this.workflowRepo.findExecutionById(tenantId, executionId);
    if (!execution) throw new NotFoundException('Execution not found');
    return execution;
  }

  getTriggerTypes() {
    return [
      { key: 'DEAL_WON', label: 'Deal Won' },
      { key: 'DEAL_LOST', label: 'Deal Lost' },
      { key: 'LEAD_CREATED', label: 'Lead Created' },
      { key: 'CONTACT_CREATED', label: 'Contact Created' },
      { key: 'WEBHOOK', label: 'Inbound Webhook' },
      { key: 'SCHEDULE', label: 'Scheduled' },
    ];
  }

  getActionTypes() {
    return [
      { key: 'SEND_EMAIL', label: 'Send Email' },
      { key: 'SEND_WHATSAPP', label: 'Send WhatsApp' },
      { key: 'CREATE_TASK', label: 'Create Task' },
      { key: 'UPDATE_DEAL', label: 'Update Deal' },
      { key: 'AI_CHAT', label: 'AI Chat' },
      { key: 'DELAY', label: 'Delay' },
    ];
  }

  async getExecutions(tenantId: string) {
    return this.workflowRepo.findExecutions(tenantId);
  }

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
      },
    );

    return { success: true, jobId: job.id };
  }
}
