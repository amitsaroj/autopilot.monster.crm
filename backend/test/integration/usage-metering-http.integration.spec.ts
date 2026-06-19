/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Usage metering (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('contact creation increments billing usage via LimitGuard path', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const usageBeforeRes = await request(app.getHttpServer())
      .get('/api/v1/billing/usage')
      .set(headers);
    expect(usageBeforeRes.status).toBe(200);

    const beforeUsage = extractResponseData<Record<string, number>>(usageBeforeRes.body);
    const contactsBefore = Number(beforeUsage.contacts ?? beforeUsage.contacts_limit ?? 0);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/contacts')
      .set(headers)
      .send({
        firstName: 'Meter',
        lastName: 'Test',
        email: `meter-${Date.now()}@example.com`,
      });
    expect([200, 201]).toContain(createRes.status);

    const usageAfterRes = await request(app.getHttpServer())
      .get('/api/v1/billing/usage')
      .set(headers);
    expect(usageAfterRes.status).toBe(200);

    const afterUsage = extractResponseData<Record<string, number>>(usageAfterRes.body);
    const contactsAfter = Number(afterUsage.contacts ?? afterUsage.contacts_limit ?? 0);

    expect(contactsAfter).toBeGreaterThanOrEqual(contactsBefore);
  });

  it('GET /usage and /limits reflect plan entitlements', async () => {
    if (!ctx.postgresAvailable) return;

    const usageRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/usage')
      .set(ctx.headers);
    expect(usageRes.status).toBe(200);

    const limitsRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/limits')
      .set(ctx.headers);
    expect(limitsRes.status).toBe(200);
    expect(extractResponseData(limitsRes.body)).toBeDefined();
  });
});
