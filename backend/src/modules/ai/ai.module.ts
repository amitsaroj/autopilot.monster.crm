import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from './ai.controller';
import { AiAgentsController, AiPromptsController } from './ai-agents.controller';
import { ConversationsController } from './conversations.controller';
import { KnowledgeBasesController } from './knowledge-bases.controller';
import { PromptTemplateController } from './prompt-template.controller';
import { RagService } from './rag.service';
import { AiPromptService } from './ai-prompt.service';
import { AiInferenceQueueService } from './ai-inference-queue.service';
import { FineTuningController } from './fine-tuning.controller';
import { FineTuningService, FineTuningRepository } from './fine-tuning.service';
import { FineTuningJob } from '../../database/entities/fine-tuning-job.entity';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { AiPrompt } from '../../database/entities/ai-prompt.entity';
import { PromptTemplate } from '../../database/entities/prompt-template.entity';
import { KnowledgeBaseService, KnowledgeBaseRepository } from './knowledge-base.service';
import { ConversationService, ConversationRepository } from './conversation.service';
import { PromptTemplateService } from './prompt-template.service';
import { CrmModule } from '../crm/crm.module';
import { StorageModule } from '../../storage/storage.module';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';
import { MonetizationModule } from '../monetization.module';
import { QUEUE_NAMES } from '../../queue/queue.constants';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    TenantSettingsModule,
    MonetizationModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.AI_INFERENCE }),
    TypeOrmModule.forFeature([
      KnowledgeBase,
      Conversation,
      Message,
      AiPrompt,
      FineTuningJob,
      PromptTemplate,
    ]),
    forwardRef(() => CrmModule),
  ],
  controllers: [
    AiController,
    AiAgentsController,
    AiPromptsController,
    KnowledgeBasesController,
    ConversationsController,
    FineTuningController,
    PromptTemplateController,
  ],
  providers: [
    RagService,
    KnowledgeBaseService,
    KnowledgeBaseRepository,
    ConversationService,
    ConversationRepository,
    AiPromptService,
    PromptTemplateService,
    AiInferenceQueueService,
    FineTuningService,
    FineTuningRepository,
  ],
  exports: [
    RagService,
    KnowledgeBaseService,
    ConversationService,
    AiPromptService,
    PromptTemplateService,
    FineTuningService,
    AiInferenceQueueService,
  ],
})
export class AiModule {}
