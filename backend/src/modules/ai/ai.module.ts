import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from './ai.controller';
import { AiAgentsController, AiPromptsController } from './ai-agents.controller';
import { ConversationsController } from './conversations.controller';
import { KnowledgeBasesController } from './knowledge-bases.controller';
import { RagService } from './rag.service';
import { AiPromptService } from './ai-prompt.service';
import { FineTuningController } from './fine-tuning.controller';
import { FineTuningService, FineTuningRepository } from './fine-tuning.service';
import { FineTuningJob } from '../../database/entities/fine-tuning-job.entity';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { AiPrompt } from '../../database/entities/ai-prompt.entity';
import { KnowledgeBaseService, KnowledgeBaseRepository } from './knowledge-base.service';
import { ConversationService, ConversationRepository } from './conversation.service';
import { CrmModule } from '../crm/crm.module';
import { StorageModule } from '../storage/storage.module';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';
import { MonetizationModule } from '../monetization.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    TenantSettingsModule,
    MonetizationModule,
    TypeOrmModule.forFeature([KnowledgeBase, Conversation, Message, AiPrompt, FineTuningJob]),
    forwardRef(() => CrmModule),
  ],
  controllers: [AiController, AiAgentsController, AiPromptsController, KnowledgeBasesController, ConversationsController, FineTuningController],
  providers: [
    RagService,
    KnowledgeBaseService,
    KnowledgeBaseRepository,
    ConversationService,
    ConversationRepository,
    AiPromptService,
    FineTuningService,
    FineTuningRepository,
  ],
  exports: [RagService, KnowledgeBaseService, ConversationService, AiPromptService, FineTuningService],
})
export class AiModule {}
