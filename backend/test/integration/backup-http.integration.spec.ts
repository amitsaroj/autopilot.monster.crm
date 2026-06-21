/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Backup (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated backup history with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/backup');
    expect(response.status).toBe(401);
  });

  it('GET /backup returns backup history', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/backup')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('POST /backup triggers backup job', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .post('/api/v1/backup')
      .set(ctx.headers);

    expect([200, 202]).toContain(response.status);
    expect(extractResponseData(response.body)).toBeDefined();
  });
});
