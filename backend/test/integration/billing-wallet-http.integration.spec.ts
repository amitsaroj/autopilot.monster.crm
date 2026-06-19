/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials, seedWalletBalance } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — billing wallet', () => {
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
    await seedWalletBalance(tenantId, 75.5);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/billing/wallet returns seeded balance', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/billing/wallet')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    const wallet = extractResponseData<{ balance: number | string; currency: string }>(
      response.body,
    );
    expect(Number(wallet.balance)).toBe(75.5);
    expect(wallet.currency).toBe('USD');
  });

  it('GET /api/v1/billing/wallet/transactions returns transaction history', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/billing/wallet/transactions')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    const transactions = extractResponseData<unknown[]>(response.body);
    expect(Array.isArray(transactions)).toBe(true);
  });
});
