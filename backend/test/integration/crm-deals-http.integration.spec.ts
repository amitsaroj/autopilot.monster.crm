/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM deals (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated deal list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/deals');
    expect(response.status).toBe(401);
  });

  it('creates pipeline, deal, marks won, and deletes deal', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const pipelineRes = await request(app.getHttpServer())
      .post('/api/v1/crm/pipelines')
      .set(headers)
      .send({
        name: `Deal Pipeline ${Date.now()}`,
        stages: [{ name: 'Qualify', order: 0, probability: 20 }],
      });

    expect([200, 201]).toContain(pipelineRes.status);
    const pipeline = extractResponseData<{ id: string; stages: Array<{ id: string }> }>(
      pipelineRes.body,
    );

    const dealRes = await request(app.getHttpServer())
      .post('/api/v1/crm/deals')
      .set(headers)
      .send({
        name: 'Secured E2E Deal',
        value: 2500,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0]?.id,
      });

    expect([200, 201]).toContain(dealRes.status);
    const dealId = extractResponseData<{ id: string }>(dealRes.body).id;
    expect(dealId).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/deals/${dealId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const wonRes = await request(app.getHttpServer())
      .patch(`/api/v1/crm/deals/${dealId}/won`)
      .set(headers);
    expect(wonRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/deals').set(headers);
    expect(listRes.status).toBe(200);

    const boardRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/deals/board?pipelineId=${pipeline.id}`)
      .set(headers);
    expect(boardRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/deals/${dealId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
