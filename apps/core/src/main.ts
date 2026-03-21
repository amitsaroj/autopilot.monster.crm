import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CoreModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './config/app.config';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(CoreModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const appCfg = configService.get<AppConfig>('app');
  if (appCfg === undefined) {
    throw new Error('App configuration missing');
  }

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: appCfg.url,
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

  // Swagger — disabled in production
  if (appCfg.nodeEnv !== 'production') {
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
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Enable graceful shutdown
  app.enableShutdownHooks();

  await app.listen(appCfg.port, appCfg.host);
}

void bootstrap();
