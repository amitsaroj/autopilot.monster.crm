/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Analytics dashboards (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated dashboard list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/analytics/dashboards');
    expect(response.status).toBe(401);
  });

  it('creates, lists, and deletes an analytics dashboard', async () => {
    if (!ctx.postgresAvailable) return;

    const createRes = await request(ctx.app.getHttpServer())
      .post('/api/v1/analytics/dashboards')
      .set(ctx.headers)
      .send({ name: `E2E Dashboard ${Date.now()}`, layout: [] });

    expect([200, 201]).toContain(createRes.status);
    const dashboardId = extractResponseData<{ id: string }>(createRes.body).id;

    const listRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/analytics/dashboards')
      .set(ctx.headers);
    expect(listRes.status).toBe(200);

    const getRes = await request(ctx.app.getHttpServer())
      .get(`/api/v1/analytics/dashboards/${dashboardId}`)
      .set(ctx.headers);
    expect(getRes.status).toBe(200);

    const deleteRes = await request(ctx.app.getHttpServer())
      .delete(`/api/v1/analytics/dashboards/${dashboardId}`)
      .set(ctx.headers);
    expect([200, 204]).toContain(deleteRes.status);
  });
});
