/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — WhatsApp read endpoints (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated WhatsApp templates with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/whatsapp/templates');
    expect(response.status).toBe(401);
  });

  it('GET /whatsapp/templates and /whatsapp/broadcasts return lists', async () => {
    if (!ctx.postgresAvailable) return;

    const templatesRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/whatsapp/templates')
      .set(ctx.headers);
    expect(templatesRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(templatesRes.body))).toBe(true);

    const broadcastsRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/whatsapp/broadcasts')
      .set(ctx.headers);
    expect(broadcastsRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(broadcastsRes.body))).toBe(true);
  });
});
