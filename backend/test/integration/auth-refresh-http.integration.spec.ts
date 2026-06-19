/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';

interface LoginResponseBody {
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
}

describe('HTTP E2E — auth refresh token', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let tenantId: string;
  let email: string;
  let password: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    const credentials = await seedTestCredentials();
    tenantId = credentials.tenantId;
    email = credentials.email;
    password = credentials.password;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /api/v1/auth/refresh returns new tokens for valid refresh token', async () => {
    if (!postgresAvailable) {
      return;
    }

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-tenant-id', tenantId)
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    const loginBody = loginRes.body as LoginResponseBody;
    const refreshToken = loginBody.data.refreshToken;

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('x-tenant-id', tenantId)
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    const refreshBody = refreshRes.body as LoginResponseBody;
    expect(refreshBody.data.accessToken).toBeDefined();
    expect(refreshBody.data.refreshToken).toBeDefined();
    expect(refreshBody.data.tokenType).toBe('Bearer');
    expect(refreshBody.data.accessToken).not.toBe(loginBody.data.accessToken);
  });

  it('POST /api/v1/auth/refresh rejects invalid refresh token', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('x-tenant-id', tenantId)
      .send({ refreshToken: 'invalid.refresh.token.value' });

    expect(response.status).toBe(401);
  });
});
