/** @jest-environment node */
import request from 'supertest';

import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP Integration — Marketplace templates', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('GET /marketplace/templates is public without auth', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/marketplace/templates');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /marketplace/templates rejects unauthenticated requests', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .post('/api/v1/marketplace/templates')
      .send({
        name: 'Test Template',
        category: 'automation',
        type: 'WORKFLOW',
        content: { steps: [] },
      });

    expect(response.status).toBe(401);
  });

  it('POST /marketplace/templates creates a template for authenticated tenant admin', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .post('/api/v1/marketplace/templates')
      .set(ctx.headers)
      .send({
        name: 'Integration Test Template',
        category: 'automation',
        type: 'WORKFLOW',
        content: { steps: [{ action: 'notify' }] },
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Integration Test Template');
  });
});
