/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM pipelines (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated pipeline list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/pipelines');
    expect(response.status).toBe(401);
  });

  it('creates, reads, updates pipeline and adds stage', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/pipelines')
      .set(headers)
      .send({
        name: `Pipeline ${Date.now()}`,
        stages: [{ name: 'New', order: 0, probability: 10 }],
      });

    expect([200, 201]).toContain(createRes.status);
    const pipelineId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/pipelines/${pipelineId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/crm/pipelines/${pipelineId}`)
      .set(headers)
      .send({ name: 'Updated Pipeline' });
    expect(updateRes.status).toBe(200);

    const stageRes = await request(app.getHttpServer())
      .post(`/api/v1/crm/pipelines/${pipelineId}/stages`)
      .set(headers)
      .send({ name: 'Negotiation', order: 1, probability: 60 });
    expect([200, 201]).toContain(stageRes.status);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/pipelines').set(headers);
    expect(listRes.status).toBe(200);

    const defaultRes = await request(app.getHttpServer())
      .get('/api/v1/crm/pipelines/default')
      .set(headers);
    expect([200, 404]).toContain(defaultRes.status);
  });
});
