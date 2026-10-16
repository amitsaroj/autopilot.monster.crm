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
import { MonetizationModule } from '../monetization.module';
import { WorkflowRuntimePolicyService } from './workflow-runtime-policy.service';
import { WorkflowVersion } from '../../database/entities/workflow-version.entity';
import { WorkflowLifecycleOutbox } from '../../database/entities/workflow-lifecycle-outbox.entity';
import { AiModule } from '../ai/ai.module';
import { WorkflowAiService } from './workflow-ai.service';
import { WorkflowSequenceService } from './workflow-sequence.service';
import { CommerceModule } from '../commerce/commerce.module';
import { WorkflowBillingEventListener } from './workflow-billing-event.listener';

@Module({
  imports: [
    EmailModule,
    WhatsappModule,
    CrmModule,
    NotificationModule,
    VoiceModule,
    MonetizationModule,
    AiModule,
    CommerceModule,
    TypeOrmModule.forFeature([Flow, WorkflowExecution, WorkflowVersion, WorkflowLifecycleOutbox]),
    BullModule.registerQueue({ name: QUEUE_NAMES.WORKFLOW }),
  ],
  controllers: [WorkflowController, WorkflowMetaController],
  providers: [
    WorkflowService,
    WorkflowProcessor,
    WorkflowExecutorService,
    WorkflowActionExecutorService,
    WorkflowRepository,
    WorkflowRuntimePolicyService,
    WorkflowAiService,
    WorkflowSequenceService,
    WorkflowEventListener,
    WorkflowBillingEventListener,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
