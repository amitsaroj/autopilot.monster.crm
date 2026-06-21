/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM campaigns (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated campaign list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/campaigns');
    expect(response.status).toBe(401);
  });

  it('creates, reads, patches, and deletes a campaign', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/campaigns')
      .set(headers)
      .send({
        name: `E2E Campaign ${Date.now()}`,
        type: 'EMAIL',
        status: 'DRAFT',
      });

    expect([200, 201]).toContain(createRes.status);
    const campaignId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/campaigns/${campaignId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const patchRes = await request(app.getHttpServer())
      .patch(`/api/v1/crm/campaigns/${campaignId}`)
      .set(headers)
      .send({ status: 'ACTIVE' });
    expect(patchRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/campaigns').set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/campaigns/${campaignId}`)
      .set(headers);
    expect([200, 204]).toContain(deleteRes.status);
  });
});
