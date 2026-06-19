/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — Analytics endpoints', () => {
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

  const endpoints = [
    'overview',
    'crm',
    'revenue',
    'pipeline',
    'team',
    'voice',
    'whatsapp',
    'ai',
    'forecast',
  ] as const;

  it.each(endpoints)('GET /analytics/%s returns 200 with data', async (path) => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);
    const response = await request(app.getHttpServer())
      .get(`/api/v1/analytics/${path}`)
      .set(headers);

    expect(response.status).toBe(200);
    expect(extractResponseData(response.body)).toBeDefined();
  });
});
