import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

import type { RedisConfig } from '../config/redis.config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get<RedisConfig>('redis');
        if (redis === undefined) {
          throw new Error('Redis configuration is missing');
        }
        return {
          store: await redisStore({
            host: redis.host,
            port: redis.port,
            password: redis.password ?? undefined,
            db: redis.db,
            tls: redis.tls ? {} : undefined,
          }),
          ttl: redis.ttl,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
