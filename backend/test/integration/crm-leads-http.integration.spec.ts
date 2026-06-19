/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM leads (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated lead list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/leads');
    expect(response.status).toBe(401);
  });

  it('creates, reads, patches, and deletes a lead', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;
    const email = `lead-e2e-${Date.now()}@example.com`;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/leads')
      .set(headers)
      .send({
        firstName: 'Lead',
        lastName: 'Prospect',
        email,
        source: 'WEB',
      });

    expect([200, 201]).toContain(createRes.status);
    const leadId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/leads/${leadId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const patchRes = await request(app.getHttpServer())
      .patch(`/api/v1/crm/leads/${leadId}`)
      .set(headers)
      .send({ firstName: 'UpdatedLead' });
    expect(patchRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/leads').set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/leads/${leadId}`)
      .set(headers);
    expect([200, 204]).toContain(deleteRes.status);
  });
});
