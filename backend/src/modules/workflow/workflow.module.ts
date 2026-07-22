import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowProcessor } from './workflow.processor';
import { WorkflowExecutorService } from './workflow-executor.service';
import { WorkflowActionExecutorService } from './workflow-action-executor.service';
import { WorkflowService } from './workflow.service';
import { WorkflowRepository } from './workflow.repository';
import { Flow } from '../../database/entities/flow.entity';
import { WorkflowExecution } from '../../database/entities/workflow-execution.entity';

import { WorkflowController } from './workflow.controller';
import { WorkflowMetaController } from './workflow-meta.controller';
import { WorkflowEventListener } from './workflow-event.listener';
import { EmailModule } from '../../shared/email/email.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { CrmModule } from '../crm/crm.module';
import { NotificationModule } from '../notifications/notification.module';
import { VoiceModule } from '../voice/voice.module';
import { QUEUE_NAMES } from '../../queue/queue.constants';

@Module({
  imports: [
    EmailModule,
    WhatsappModule,
    CrmModule,
    NotificationModule,
    VoiceModule,
    TypeOrmModule.forFeature([Flow, WorkflowExecution]),
    BullModule.registerQueue({ name: QUEUE_NAMES.WORKFLOW }),
  ],
  controllers: [WorkflowController, WorkflowMetaController],
  providers: [
    WorkflowService,
    WorkflowProcessor,
    WorkflowExecutorService,
    WorkflowActionExecutorService,
    WorkflowRepository,
    WorkflowEventListener,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
