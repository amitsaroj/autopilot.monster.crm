/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Scheduler (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated scheduler list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/scheduler');
    expect(response.status).toBe(401);
  });

  it('creates, lists, and deletes a scheduled job', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/scheduler')
      .set(headers)
      .send({
        name: `E2E Job ${Date.now()}`,
        cron: '0 9 * * 1',
        action: 'SEND_EMAIL',
        payload: { template: 'weekly_digest' },
      });

    expect([200, 201]).toContain(createRes.status);
    const jobId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/scheduler/${jobId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/scheduler').set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/scheduler/${jobId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
