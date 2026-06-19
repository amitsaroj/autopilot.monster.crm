/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — Voice platform', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let tenantId: string;
  let accessToken: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    const credentials = await seedTestCredentials();
    tenantId = credentials.tenantId;
    accessToken = await loginTestUser(app, credentials);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/voice/calls returns tenant-scoped list', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/voice/calls')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/v1/voice/settings returns voice configuration', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/voice/settings')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('twilio_account_sid');
    expect(response.body.data).toHaveProperty('voice_default_profile');
  });

  it('GET /api/v1/voice/profiles lists AI voice profiles', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/voice/profiles')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.profiles)).toBe(true);
  });

  it('GET /api/v1/analytics/voice returns voice analytics payload', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/analytics/voice')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('totalCalls');
    expect(response.body.data).toHaveProperty('sentiment');
  });
});
