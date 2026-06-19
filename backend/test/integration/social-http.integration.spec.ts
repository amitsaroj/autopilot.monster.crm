/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Social posts (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated social posts with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/social/posts');
    expect(response.status).toBe(401);
  });

  it('schedules, lists, and deletes a social post', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const scheduleRes = await request(app.getHttpServer())
      .post('/api/v1/social/schedule')
      .set(headers)
      .send({
        platform: 'LINKEDIN',
        content: `E2E post ${Date.now()}`,
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      });

    expect([200, 201]).toContain(scheduleRes.status);
    const postId = extractResponseData<{ id: string }>(scheduleRes.body).id;

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/social/posts')
      .set(headers);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(listRes.body))).toBe(true);

    const analyticsRes = await request(app.getHttpServer())
      .get('/api/v1/social/analytics')
      .set(headers);
    expect(analyticsRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/social/posts/${postId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
