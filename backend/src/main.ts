import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { CoreModule } from './app.module';
import type { AppConfig } from './config/app.config';
import { env } from './config/env.config';
import { AppLogger } from './logger/logger.service';

function isAllowedCorsOrigin(origin: string, frontendUrl: string): boolean {
  try {
    const requestUrl = new URL(origin);
    if (requestUrl.protocol !== 'https:') return false;
    const rootHost = new URL(frontendUrl).hostname.replace(/^www\./, '');
    return requestUrl.hostname === rootHost || requestUrl.hostname.endsWith(`.${rootHost}`);
  } catch {
    return false;
  }
}

const sentryDsn = env.sentry.dsn;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: env.sentry.tracesSampleRate,
    profilesSampleRate: env.sentry.profilesSampleRate,
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(CoreModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  app.useLogger(app.get(AppLogger));
  const appCfg = configService.get<AppConfig>('app');
  if (appCfg === undefined) {
    throw new Error('App configuration missing');
  }

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  const isProd = appCfg.nodeEnv === 'production';
  if (isProd) {
    // The production compose stack places nginx in front of the API. This keeps
    // client IP based controls (such as throttling) accurate behind that proxy.
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }
  if (isProd) {
    if (!appCfg.url.startsWith('https://')) {
      throw new Error('APP_URL must use https:// in production');
    }
    if (!appCfg.frontendUrl.startsWith('https://')) {
      throw new Error('FRONTEND_URL must use https:// in production');
    }
  }
  app.enableCors({
    origin: isProd
      ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || isAllowedCorsOrigin(origin, appCfg.frontendUrl)) {
            callback(null, true);
          } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
          }
        }
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-tenant-id',
      'x-correlation-id',
      'x-api-key',
    ],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger — disabled in production to reduce attack surface
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AutopilotMonster CRM API')
    .setDescription('Full-Stack AI-Powered CRM Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'ApiKey')
    .addGlobalParameters({
      in: 'header',
      name: 'x-tenant-id',
      required: true,
      schema: { type: 'string' },
    })
    .addGlobalParameters({
      in: 'header',
      name: 'x-correlation-id',
      required: false,
      schema: { type: 'string' },
    })
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Provide interactive docs in non-production only
  if (!isProd) {
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Keep the API contract private in production unless it is deliberately
  // published for an integration. Non-production environments always expose it.
  if (!isProd || appCfg.publishOpenApi) {
    app.getHttpAdapter().get('/openapi.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.status(200).send(document);
    });
  }

  // MCP handshake endpoint (minimal) for agents — optional
  if (appCfg.publishOpenApi) {
    app.getHttpAdapter().get('/.well-known/mcp/handshake', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).json({
        name: 'AutopilotMonster MCP',
        transport: 'streamablehttp',
        openapi: '/openapi.json',
      });
    });
  }

  // Enable graceful shutdown
  app.enableShutdownHooks();

  await app.listen(appCfg.port, appCfg.host);
}

void bootstrap();
