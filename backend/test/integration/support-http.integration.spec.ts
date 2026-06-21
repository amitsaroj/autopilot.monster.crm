/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Support tickets (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated ticket list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/support/tickets');
    expect(response.status).toBe(401);
  });

  it('creates, reads, updates, and deletes a support ticket', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/support/tickets')
      .set(headers)
      .send({
        subject: `E2E Ticket ${Date.now()}`,
        description: 'Integration test ticket',
        priority: 'MEDIUM',
        status: 'OPEN',
      });

    expect([200, 201]).toContain(createRes.status);
    const ticketId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/support/tickets/${ticketId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/support/tickets/${ticketId}`)
      .set(headers)
      .send({ status: 'IN_PROGRESS' });
    expect(updateRes.status).toBe(200);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/support/tickets')
      .set(headers);
    expect(listRes.status).toBe(200);

    const statsRes = await request(app.getHttpServer())
      .get('/api/v1/support/stats')
      .set(headers);
    expect(statsRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/support/tickets/${ticketId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });

  it('manages knowledge base articles', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/support/articles')
      .set(headers)
      .send({
        title: `E2E Article ${Date.now()}`,
        content: 'Help article content',
        category: 'GENERAL',
      });

    expect([200, 201]).toContain(createRes.status);
    const articleId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/support/articles/${articleId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/support/articles')
      .set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/support/articles/${articleId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
