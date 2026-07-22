/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP Integration — Developer platform', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('GET /developer/webhooks rejects unauthenticated requests', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/developer/webhooks');
    expect(response.status).toBe(401);
  });

  it('GET /developer/webhooks returns tenant webhooks when authenticated', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/developer/webhooks')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /developer/webhooks creates a webhook with validation', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .post('/api/v1/developer/webhooks')
      .set(ctx.headers)
      .send({
        name: 'Integration Webhook',
        url: 'https://example.com/webhook',
        events: ['contact.created'],
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Integration Webhook');
  });

  it('GET /developer/oauth/apps returns OAuth apps when authenticated', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/developer/oauth/apps')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /developer/logs/stats returns usage stats when authenticated', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/developer/logs/stats')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(extractResponseData(response.body)).toBeDefined();
  });
});
