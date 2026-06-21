/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedCrossTenantCredentials, seedWalletBalance } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — cross-tenant isolation', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let primaryTenantId: string;
  let secondaryTenantId: string;
  let primaryToken: string;
  let secondaryToken: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    const credentials = await seedCrossTenantCredentials();
    primaryTenantId = credentials.primary.tenantId;
    secondaryTenantId = credentials.secondary.tenantId;
    primaryToken = await loginTestUser(app, credentials.primary);
    secondaryToken = await loginTestUser(app, credentials.secondary);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('tenant B cannot read tenant A contact by id', async () => {
    if (!postgresAvailable) {
      return;
    }

    const primaryHeaders = authRequestHeaders(primaryTenantId, primaryToken);
    const secondaryHeaders = authRequestHeaders(secondaryTenantId, secondaryToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/contacts')
      .set(primaryHeaders)
      .send({
        firstName: 'TenantA',
        lastName: 'Contact',
        email: `tenant-a-${Date.now()}@example.com`,
      });

    expect([200, 201]).toContain(createRes.status);
    const contactId = extractResponseData<{ id: string }>(createRes.body).id;

    const crossTenantRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/contacts/${contactId}`)
      .set(secondaryHeaders);

    expect([403, 404]).toContain(crossTenantRes.status);
  });

  it('tenant B cannot read tenant A deal by id', async () => {
    if (!postgresAvailable) {
      return;
    }

    const primaryHeaders = authRequestHeaders(primaryTenantId, primaryToken);
    const secondaryHeaders = authRequestHeaders(secondaryTenantId, secondaryToken);

    const pipelineRes = await request(app.getHttpServer())
      .post('/api/v1/crm/pipelines')
      .set(primaryHeaders)
      .send({ name: `E2E Pipeline ${Date.now()}`, stages: [{ name: 'New', order: 0, probability: 10 }] });

    expect([200, 201]).toContain(pipelineRes.status);
    const pipeline = extractResponseData<{ id: string; stages: Array<{ id: string }> }>(pipelineRes.body);

    const dealRes = await request(app.getHttpServer())
      .post('/api/v1/crm/deals')
      .set(primaryHeaders)
      .send({
        name: 'Tenant A Deal',
        value: 1000,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0]?.id,
      });

    expect([200, 201]).toContain(dealRes.status);
    const dealId = extractResponseData<{ id: string }>(dealRes.body).id;

    const crossTenantRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/deals/${dealId}`)
      .set(secondaryHeaders);

    expect([403, 404]).toContain(crossTenantRes.status);
  });

  it('wallet balances are scoped per tenant', async () => {
    if (!postgresAvailable) {
      return;
    }

    const primaryHeaders = authRequestHeaders(primaryTenantId, primaryToken);
    const secondaryHeaders = authRequestHeaders(secondaryTenantId, secondaryToken);

    await seedWalletBalance(primaryTenantId, 50);
    await seedWalletBalance(secondaryTenantId, 0);

    const primaryWallet = await request(app.getHttpServer())
      .get('/api/v1/billing/wallet')
      .set(primaryHeaders);

    const secondaryWallet = await request(app.getHttpServer())
      .get('/api/v1/billing/wallet')
      .set(secondaryHeaders);

    expect(primaryWallet.status).toBe(200);
    expect(secondaryWallet.status).toBe(200);

    const primaryBalance = Number(extractResponseData<{ balance: number }>(primaryWallet.body).balance);
    const secondaryBalance = Number(extractResponseData<{ balance: number }>(secondaryWallet.body).balance);

    expect(primaryBalance).toBeGreaterThanOrEqual(50);
    expect(secondaryBalance).toBeLessThan(primaryBalance);
  });
});
