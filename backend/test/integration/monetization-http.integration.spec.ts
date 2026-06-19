/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Monetization (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('GET /monetization/plans is public', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/monetization/plans');
    expect(response.status).toBe(200);
  });

  it('rejects unauthenticated monetization subscription with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/monetization/subscription');
    expect(response.status).toBe(401);
  });

  it('GET /monetization/subscription, /invoices, /usage return billing data', async () => {
    if (!ctx.postgresAvailable) return;

    const subRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/monetization/subscription')
      .set(ctx.headers);
    expect(subRes.status).toBe(200);

    const invoicesRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/monetization/invoices')
      .set(ctx.headers);
    expect(invoicesRes.status).toBe(200);

    const usageRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/monetization/usage')
      .set(ctx.headers);
    expect(usageRes.status).toBe(200);
    expect(extractResponseData(usageRes.body)).toBeDefined();
  });
});
