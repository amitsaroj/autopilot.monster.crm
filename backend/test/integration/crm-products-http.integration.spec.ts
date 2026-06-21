/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM products (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated product list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/products');
    expect(response.status).toBe(401);
  });

  it('creates, reads, updates, and deletes a product', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/products')
      .set(headers)
      .send({
        name: `E2E Product ${Date.now()}`,
        unitPrice: 99.99,
        currency: 'USD',
      });

    expect([200, 201]).toContain(createRes.status);
    const productId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/products/${productId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/crm/products/${productId}`)
      .set(headers)
      .send({ name: 'Updated Product', unitPrice: 149.99 });
    expect(updateRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/products').set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/products/${productId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
