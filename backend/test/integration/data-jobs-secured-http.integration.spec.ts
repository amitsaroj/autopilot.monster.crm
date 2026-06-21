/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Data jobs import/export (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated import history with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/import/history');
    expect(response.status).toBe(401);
  });

  it('GET /import/history and /export/history return job lists', async () => {
    if (!ctx.postgresAvailable) return;

    const importRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/import/history')
      .set(ctx.headers);
    expect(importRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(importRes.body))).toBe(true);

    const exportRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/export/history')
      .set(ctx.headers);
    expect(exportRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(exportRes.body))).toBe(true);
  });
});
