/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Tenant settings (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated workspace settings with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/settings/workspace');
    expect(response.status).toBe(401);
  });

  it('GET /settings/workspace returns workspace profile', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/settings/workspace')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(extractResponseData(response.body)).toBeDefined();
  });

  it('GET /settings/integrations returns integration settings', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/settings/integrations')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('GET /settings/api-keys and /settings/webhooks return developer settings', async () => {
    if (!ctx.postgresAvailable) return;

    const apiKeysRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/settings/api-keys')
      .set(ctx.headers);
    expect(apiKeysRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(apiKeysRes.body))).toBe(true);

    const webhooksRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/settings/webhooks')
      .set(ctx.headers);
    expect(webhooksRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(webhooksRes.body))).toBe(true);

    const oauthRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/settings/oauth-apps')
      .set(ctx.headers);
    expect(oauthRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(oauthRes.body))).toBe(true);
  });
});
