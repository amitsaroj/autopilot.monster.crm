import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { WorkflowProcessor } from './workflow.processor';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [
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
  providers: [WorkflowService, WorkflowProcessor],
  exports: [WorkflowService],
})
export class WorkflowModule {}
