/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';

describe('HTTP E2E — health', () => {
  let app: INestApplication;
  let postgresAvailable = false;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }
    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/health responds when postgres is available', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer()).get('/api/v1/health');
    expect([200, 503]).toContain(response.status);
  });
});
