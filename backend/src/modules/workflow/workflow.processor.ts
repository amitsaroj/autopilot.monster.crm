import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WorkflowRepository } from './workflow.repository';
import { EmailService } from '../../shared/email/email.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Processor('workflows')
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsappService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Executing Workflow Job ${job.id} for event: ${job.data.eventName}`);

    const { workflowId, executionId, tenantId } = job.data;

    let executionRecord;
    try {
      executionRecord = await this.workflowRepo.createExecution({
        id: executionId,
        tenantId,
        flowId: workflowId,
        status: 'RUNNING',
        startedAt: new Date(),
        output: { logs: [`Job started for event: ${job.data.eventName}`] },
      });

      // 1. Fetch Workflow Definition
      this.logger.debug(`Fetching definition for workflow ${workflowId}...`);
      const flow = await this.workflowRepo.findById(tenantId, workflowId);
      
      if (!flow || !flow.definition) {
        throw new Error(`Flow ${workflowId} not found or missing definition.`);
      }

      const { nodes = [], edges = [] } = flow.definition;
      
      // Basic Linear Execution: Find trigger node, follow edges
      const triggerNode = nodes.find((n: any) => n.type === 'trigger' || n.type === 'webhook');
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow.');
      }

      let currentNodeId = triggerNode.id;
      let stepCount = 0;

      while (currentNodeId) {
        if (stepCount > 50) throw new Error('Infinite loop detected in workflow execution.');
        const node = nodes.find((n: any) => n.id === currentNodeId);
        if (!node) break;

        executionRecord.output.logs.push(`Executing node: ${node.type} (${node.id})`);

        if (node.type === 'action' || node.type === 'email' || node.type === 'whatsapp') {
           this.logger.log(`Executing Action [${node.type}]: ${JSON.stringify(node.data)}`);
           
           if (node.type === 'email') {
             const { to, subject, body } = node.data;
             await this.emailService.sendEmail(to, subject, body);
           } else if (node.type === 'whatsapp') {
             const { to, text, wabaId } = node.data;
             await this.whatsappService.sendTextMessage(to, text, wabaId, tenantId);
           }
        } else if (node.type === 'condition') {
           this.logger.debug(`Evaluating condition: ${JSON.stringify(node.data)}`);
           // Condition evaluation logic here
        }

        // Find next node via edges
        const nextEdge = edges.find((e: any) => e.source === currentNodeId);
        currentNodeId = nextEdge ? nextEdge.target : null;
        stepCount++;
      }

      executionRecord.status = 'COMPLETED';
      executionRecord.completedAt = new Date();
      executionRecord.output.logs.push(`Workflow execution completed successfully.`);
      await this.workflowRepo.createExecution(executionRecord); // Update

      this.logger.log(`Workflow ${job.id} execution completed.`);
      return { status: 'COMPLETED' };
    } catch (err: any) {
      this.logger.error(`Workflow ${job.id} failed`, err.stack);
      
      if (executionRecord) {
        executionRecord.status = 'FAILED';
        executionRecord.completedAt = new Date();
        executionRecord.error = err.message;
        executionRecord.output.logs.push(`ERROR: ${err.message}`);
        await this.workflowRepo.createExecution(executionRecord);
      }
      
      throw err; // Throws to BullMQ for retry
    }
  }
}
