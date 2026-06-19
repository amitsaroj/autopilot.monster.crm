/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM quotes (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated quote list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/quotes');
    expect(response.status).toBe(401);
  });

  it('creates contact, quote, reads list, and deletes quote', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const contactRes = await request(app.getHttpServer())
      .post('/api/v1/crm/contacts')
      .set(headers)
      .send({
        firstName: 'Quote',
        lastName: 'Customer',
        email: `quote-${Date.now()}@example.com`,
      });

    expect([200, 201]).toContain(contactRes.status);
    const contactId = extractResponseData<{ id: string }>(contactRes.body).id;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/quotes')
      .set(headers)
      .send({
        title: `E2E Quote ${Date.now()}`,
        contactId,
        lineItems: [{ description: 'Service', quantity: 1, unitPrice: 500 }],
      });

    expect([200, 201]).toContain(createRes.status);
    const quoteId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/quotes/${quoteId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/quotes').set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/quotes/${quoteId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
