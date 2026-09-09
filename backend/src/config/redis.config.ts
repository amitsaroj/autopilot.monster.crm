import { registerAs } from '@nestjs/config';

import { env } from './env.config';

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  tls: boolean;
  ttl: number;
}

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    db: env.redis.db,
    tls: env.redis.tls,
    ttl: env.redis.ttl,
  }),
);
