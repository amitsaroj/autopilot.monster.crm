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

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([KnowledgeBase, Conversation, Message])],
  controllers: [AiController],
  providers: [
    RagService,
    KnowledgeBaseService,
    KnowledgeBaseRepository,
    ConversationService,
    ConversationRepository,
  ],
  exports: [RagService, KnowledgeBaseService, ConversationService],
})
export class AiModule {}
