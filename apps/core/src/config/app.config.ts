import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  url: string;
  secret: string;
  logLevel: string;
  logFormat: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['APP_PORT'] ?? '3333', 10),
    host: process.env['APP_HOST'] ?? '0.0.0.0',
    url: process.env['APP_URL'] ?? 'http://localhost:3333',
    secret: process.env['APP_SECRET'] ?? '',
    logLevel: process.env['LOG_LEVEL'] ?? 'debug',
    logFormat: process.env['LOG_FORMAT'] ?? 'json',
  }),
);
