import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from './ai.controller';
import { RagService } from './rag.service';
import { KnowledgeBase } from '../../database/entities/knowledge-base.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { KnowledgeBaseService, KnowledgeBaseRepository } from './knowledge-base.service';
import { ConversationService, ConversationRepository } from './conversation.service';
import { PromptTemplateService } from './prompt-template.service';
import { PromptTemplateController } from './prompt-template.controller';
import { PromptTemplate } from '../../database/entities/prompt-template.entity';

import { MonetizationModule } from '../monetization.module';

@Module({
  imports: [
    ConfigModule,
    MonetizationModule,
    TypeOrmModule.forFeature([KnowledgeBase, Conversation, Message, PromptTemplate])
  ],
  controllers: [AiController, PromptTemplateController],
  providers: [
    RagService,
    KnowledgeBaseService,
    KnowledgeBaseRepository,
    ConversationService,
    ConversationRepository,
    PromptTemplateService,
  ],
  exports: [RagService, KnowledgeBaseService, ConversationService, PromptTemplateService],
})
export class AiModule {}
