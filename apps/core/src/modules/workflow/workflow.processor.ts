import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('workflows')
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Executing Workflow Job ${job.id} for event: ${job.data.eventName}`);
    
    const { workflowId, tenantId, payload } = job.data;

    try {
      // 1. Fetch Workflow Definition Steps from DB
      this.logger.debug(`Fetching steps for workflow ${workflowId}...`);
      
      const mockSteps = [
        { type: 'CONDITION', config: { field: 'deal.value', operator: 'gt', value: 1000 } },
        { type: 'ACTION', config: { actionParams: { channel: 'WHATSAPP', message: 'Hello!' } } }
      ];

      // 2. Iterate Steps
      for (const step of mockSteps) {
         if (step.type === 'CONDITION') {
           this.logger.debug('Evaluating condition: ' + JSON.stringify(step.config));
           // if condition false -> return
         }
         
         if (step.type === 'ACTION') {
           this.logger.log(`Executing Action: ${step.config.actionParams.channel}`);
           // Call respective service (WhatsappService, TwilioService, EmailService)
           
           // await this.whatsappService.sendTextMessage(...)
         }
      }

      this.logger.log(`Workflow ${job.id} execution completed successfully.`);
      return { status: 'COMPLETED' };
      
    } catch (err: any) {
      this.logger.error(`Workflow ${job.id} failed`, err.stack);
      throw err; // Throws to BullMQ for exponentially backed-off retry
    }
  }
}
