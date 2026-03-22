import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiController } from './ai.controller';
import { RagService } from './rag.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [RagService],
  exports: [RagService],
})
export class AiModule {}
