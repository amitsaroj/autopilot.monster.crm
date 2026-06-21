import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';

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

@Module({
  imports: [
    EmailModule,
    WhatsappModule,
    TypeOrmModule.forFeature([Flow, WorkflowExecution]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = configService.get('redis');
        return {
          connection: {
            host: redis.host,
            port: redis.port,
            password: redis.password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'workflows',
    }),
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
