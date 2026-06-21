/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — secured global guards', () => {
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

  it('rejects unauthenticated CRM list with 401', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer()).get('/api/v1/crm/contacts');

    expect(response.status).toBe(401);
  });

  it('rejects requests with tenant header mismatch', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/crm/contacts')
      .set('x-tenant-id', '00000000-0000-0000-0000-000000000099')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(401);
  });

  it('allows authenticated CRM list with valid JWT and tenant', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/crm/contacts')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
  });

  it('allows authenticated billing wallet read through PlanGuard', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/billing/wallet')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});
