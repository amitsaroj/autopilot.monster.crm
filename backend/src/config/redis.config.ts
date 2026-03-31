import { registerAs } from '@nestjs/config';

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
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] ?? '',
    db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
    tls: process.env['REDIS_TLS'] === 'true',
    ttl: parseInt(process.env['REDIS_TTL'] ?? '3600', 10),
  }),
);
