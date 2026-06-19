/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Platform usage (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated platform usage with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/usage');
    expect(response.status).toBe(401);
  });

  it('GET /usage, /limits, /features return tenant platform data', async () => {
    if (!ctx.postgresAvailable) return;

    const usageRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/usage')
      .set(ctx.headers);
    expect(usageRes.status).toBe(200);
    expect(extractResponseData(usageRes.body)).toBeDefined();

    const limitsRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/limits')
      .set(ctx.headers);
    expect(limitsRes.status).toBe(200);

    const featuresRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/features')
      .set(ctx.headers);
    expect(featuresRes.status).toBe(200);
  });
});
