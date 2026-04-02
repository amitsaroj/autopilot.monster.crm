import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  url: string;
  frontendUrl: string;
  secret: string;
  logLevel: string;
  logFormat: string;
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  facebook: {
    appId: string;
    appSecret: string;
    callbackUrl: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  apple: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
    callbackUrl: string;
  };
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['APP_PORT'] ?? '3333', 10),
    host: process.env['APP_HOST'] ?? '0.0.0.0',
    url: process.env['APP_URL'] ?? 'http://localhost:8000',
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    secret: process.env['APP_SECRET'] ?? '',
    logLevel: process.env['LOG_LEVEL'] ?? 'debug',
    logFormat: process.env['LOG_FORMAT'] ?? 'json',
    google: {
      clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
      callbackUrl: process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/google/callback',
    },
    facebook: {
      appId: process.env['FACEBOOK_APP_ID'] ?? '',
      appSecret: process.env['FACEBOOK_APP_SECRET'] ?? '',
      callbackUrl: process.env['FACEBOOK_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/facebook/callback',
    },
    github: {
      clientId: process.env['GITHUB_CLIENT_ID'] ?? '',
      clientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? '',
      callbackUrl: process.env['GITHUB_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/github/callback',
    },
    apple: {
      clientId: process.env['APPLE_CLIENT_ID'] ?? '',
      teamId: process.env['APPLE_TEAM_ID'] ?? '',
      keyId: process.env['APPLE_KEY_ID'] ?? '',
      privateKey: process.env['APPLE_PRIVATE_KEY'] ?? '',
      callbackUrl: process.env['APPLE_CALLBACK_URL'] ?? 'http://localhost:8000/api/v1/auth/apple/callback',
    },
  }),
);
