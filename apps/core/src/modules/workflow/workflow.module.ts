import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { WorkflowProcessor } from './workflow.processor';
import { WorkflowService } from './workflow.service';

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
