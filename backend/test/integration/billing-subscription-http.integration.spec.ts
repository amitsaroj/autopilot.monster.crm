/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Billing subscription (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated billing subscription with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/billing/subscription');
    expect(response.status).toBe(401);
  });

  it('GET /billing/plans returns available plans', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/billing/plans')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('GET /billing/subscription returns active subscription', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/billing/subscription')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(extractResponseData(response.body)).toBeDefined();
  });

  it('GET /billing/invoices and /billing/usage return billing data', async () => {
    if (!ctx.postgresAvailable) return;

    const invoicesRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/billing/invoices')
      .set(ctx.headers);
    expect(invoicesRes.status).toBe(200);

    const usageRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/billing/usage')
      .set(ctx.headers);
    expect(usageRes.status).toBe(200);
    expect(extractResponseData(usageRes.body)).toBeDefined();
  });

  it('GET /billing/payment-methods returns payment methods list', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/billing/payment-methods')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });
});
