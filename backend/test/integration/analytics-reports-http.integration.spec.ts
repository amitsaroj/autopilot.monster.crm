/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';

describe('HTTP E2E — Analytics reports CRUD', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let tenantId: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    const credentials = await seedTestCredentials();
    tenantId = credentials.tenantId;
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

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/analytics/reports')
      .set('x-tenant-id', tenantId)
      .send({
        name: 'E2E CRM Report',
        reportType: 'CRM',
      });

    expect([200, 201]).toContain(createRes.status);
    const reportId = createRes.body.data?.id;
    expect(reportId).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/analytics/reports')
      .set('x-tenant-id', tenantId);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const runRes = await request(app.getHttpServer())
      .post(`/api/v1/analytics/reports/${reportId}/run`)
      .set('x-tenant-id', tenantId);

    expect(runRes.status).toBe(200);
    expect(runRes.body.data.status).toBe('READY');

    const resultsRes = await request(app.getHttpServer())
      .get(`/api/v1/analytics/reports/${reportId}/results`)
      .set('x-tenant-id', tenantId);

    expect(resultsRes.status).toBe(200);
    expect(resultsRes.body.data).toBeDefined();

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/analytics/reports/${reportId}`)
      .set('x-tenant-id', tenantId);

    expect(deleteRes.status).toBe(200);
  });
});
