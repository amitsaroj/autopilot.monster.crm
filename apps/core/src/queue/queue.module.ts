import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QUEUE_NAMES } from './queue.constants';
import type { RedisConfig } from '../config/redis.config';

const queueList = Object.values(QUEUE_NAMES);

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = configService.get<RedisConfig>('redis');
        if (redis === undefined) {
          throw new Error('Redis configuration is missing for queue');
        }
        return {
          redis: {
            host: process.env['QUEUE_REDIS_HOST'] ?? redis.host,
            port: parseInt(process.env['QUEUE_REDIS_PORT'] ?? String(redis.port), 10),
            password: process.env['QUEUE_REDIS_PASSWORD'] ?? redis.password,
          },
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: parseInt(process.env['QUEUE_MAX_ATTEMPTS'] ?? '3', 10),
            backoff: {
              type: 'exponential',
              delay: parseInt(process.env['QUEUE_BACKOFF_DELAY'] ?? '5000', 10),
            },
          },
        };
      },
    }),
    ...queueList.map((name) => BullModule.registerQueue({ name })),
  ],
  exports: [BullModule],
})
export class QueueModule {}
