import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from './ai.controller';
import { AiAgentsController, AiPromptsController } from './ai-agents.controller';
import { ConversationsController } from './conversations.controller';
import { KnowledgeBasesController } from './knowledge-bases.controller';
import { RagService } from './rag.service';
import { AiPromptService } from './ai-prompt.service';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { AiPrompt } from '../../database/entities/ai-prompt.entity';
import { KnowledgeBaseService, KnowledgeBaseRepository } from './knowledge-base.service';
import { ConversationService, ConversationRepository } from './conversation.service';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([KnowledgeBase, Conversation, Message, AiPrompt]),
    forwardRef(() => CrmModule),
  ],
  controllers: [AiController, AiAgentsController, AiPromptsController, KnowledgeBasesController, ConversationsController],
  providers: [
    RagService,
    KnowledgeBaseService,
    KnowledgeBaseRepository,
    ConversationService,
    ConversationRepository,
    AiPromptService,
  ],
  exports: [RagService, KnowledgeBaseService, ConversationService, AiPromptService],
})
export class AiModule {}
