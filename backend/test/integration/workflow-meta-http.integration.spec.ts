/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Workflow meta and trigger (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated workflow triggers with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/workflow-triggers');
    expect(response.status).toBe(401);
  });

  it('GET /workflow-triggers and /workflow-actions return metadata', async () => {
    if (!ctx.postgresAvailable) return;

    const triggersRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/workflow-triggers')
      .set(ctx.headers);
    expect(triggersRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(triggersRes.body))).toBe(true);

    const actionsRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/workflow-actions')
      .set(ctx.headers);
    expect(actionsRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(actionsRes.body))).toBe(true);
  });

  it('GET /workflows/executions returns execution history', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/workflows/executions')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('POST /workflows/:id/trigger manually executes workflow', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/workflows')
      .set(headers)
      .send({
        name: `Trigger Test ${Date.now()}`,
        type: 'voice',
        definition: { nodes: [], edges: [] },
      });

    expect([200, 201]).toContain(createRes.status);
    const workflowId = extractResponseData<{ id: string }>(createRes.body).id;

    const triggerRes = await request(app.getHttpServer())
      .post(`/api/v1/workflows/${workflowId}/trigger`)
      .set(headers)
      .send({ contactId: 'test-contact' });

    expect([200, 201, 202]).toContain(triggerRes.status);

    await request(app.getHttpServer())
      .delete(`/api/v1/workflows/${workflowId}`)
      .set(headers);
  });
});
