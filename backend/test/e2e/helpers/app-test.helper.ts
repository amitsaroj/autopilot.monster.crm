import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { CoreModule } from '../../../src/app.module';

const legacyTestAppGuard = {
  canActivate: (context: {
    switchToHttp: () => { getRequest: () => Record<string, unknown> & { headers?: Record<string, string> } };
  }) => {
    const req = context.switchToHttp().getRequest();
    if (!req.tenantId) {
      req.tenantId = req.headers?.['x-tenant-id'] ?? 'test-tenant';
    }
    return true;
  },
};

/**
 * Boots the full Nest application with production global guards (JWT, Tenant, Roles,
 * Permissions, Plan, Limit). Use for integration tests that validate real auth behaviour.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [CoreModule],
  }).compile();

  const app = moduleFixture.createNestApplication({ rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

/**
 * @deprecated Prefer createTestApp() with seeded credentials. Bypasses all APP_GUARD checks.
 */
export async function createTestAppWithMockGuards(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [CoreModule],
  })
    .overrideProvider(APP_GUARD)
    .useValue(legacyTestAppGuard)
    .compile();

  const app = moduleFixture.createNestApplication({ rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

export async function isMinioReachable(): Promise<boolean> {
  try {
    const Minio = await import('minio');
    const client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    });
    await client.listBuckets();
    return true;
  } catch {
    return false;
  }
}

export async function isPostgresReachable(): Promise<boolean> {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: process.env.DB_NAME ?? 'autopilot_monster',
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'password',
      connectionTimeoutMillis: 2000,
    });
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}
