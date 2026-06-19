/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';

describe('HTTP E2E — auth login', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let credentials: Awaited<ReturnType<typeof seedTestCredentials>>;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    credentials = await seedTestCredentials();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /api/v1/auth/login returns tokens for valid credentials', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-tenant-id', credentials.tenantId)
      .send({ email: credentials.email, password: credentials.password });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.tokenType).toBe('Bearer');
  });

  it('POST /api/v1/auth/login rejects invalid password', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-tenant-id', credentials.tenantId)
      .send({ email: credentials.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
  });
});
