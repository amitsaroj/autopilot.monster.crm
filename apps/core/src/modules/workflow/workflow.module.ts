import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowProcessor } from './workflow.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflows',
    }),
  ],
  providers: [WorkflowService, WorkflowProcessor],
  exports: [WorkflowService],
})
export class WorkflowModule {}
