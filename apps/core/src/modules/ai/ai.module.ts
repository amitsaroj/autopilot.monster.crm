import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { RagService } from './rag.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [RagService],
  exports: [RagService],
})
export class AiModule {}
