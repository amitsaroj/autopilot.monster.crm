/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Notifications (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated notification list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/notifications');
    expect(response.status).toBe(401);
  });

  it('GET /notifications returns tenant notifications', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/notifications')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('GET and PATCH /notifications/preferences', async () => {
    if (!ctx.postgresAvailable) return;

    const getRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/notifications/preferences')
      .set(ctx.headers);
    expect(getRes.status).toBe(200);

    const patchRes = await request(ctx.app.getHttpServer())
      .patch('/api/v1/notifications/preferences')
      .set(ctx.headers)
      .send({ emailEnabled: true, pushEnabled: false });
    expect(patchRes.status).toBe(200);
  });

  it('PATCH /notifications/read-all marks all as read', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .patch('/api/v1/notifications/read-all')
      .set(ctx.headers);

    expect(response.status).toBe(200);
  });
});
