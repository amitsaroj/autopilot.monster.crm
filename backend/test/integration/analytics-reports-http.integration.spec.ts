/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — Analytics reports CRUD', () => {
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

  it('creates, runs, and retrieves report results', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/analytics/reports')
      .set(headers)
      .send({
        name: 'E2E CRM Report',
        reportType: 'CRM',
      });

    expect([200, 201]).toContain(createRes.status);
    const reportId = extractResponseData<{ id: string }>(createRes.body).id;
    expect(reportId).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/analytics/reports')
      .set(headers);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(listRes.body))).toBe(true);

    const runRes = await request(app.getHttpServer())
      .post(`/api/v1/analytics/reports/${reportId}/run`)
      .set(headers);

    expect([200, 201]).toContain(runRes.status);
    expect(extractResponseData<{ status: string }>(runRes.body).status).toBe('READY');

    const resultsRes = await request(app.getHttpServer())
      .get(`/api/v1/analytics/reports/${reportId}/results`)
      .set(headers);

    expect(resultsRes.status).toBe(200);
    expect(extractResponseData(resultsRes.body)).toBeDefined();

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/analytics/reports/${reportId}`)
      .set(headers);

    expect([200, 204]).toContain(deleteRes.status);
  });
});
