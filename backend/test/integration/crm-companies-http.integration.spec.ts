/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM companies (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated company list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/companies');
    expect(response.status).toBe(401);
  });

  it('creates, reads, updates, and deletes a company', async () => {
    if (!ctx.postgresAvailable) return;

    const { app, headers } = ctx;

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/companies')
      .set(headers)
      .send({ name: `E2E Company ${Date.now()}`, industry: 'Technology' });

    expect([200, 201]).toContain(createRes.status);
    const companyId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/companies/${companyId}`)
      .set(headers);
    expect(getRes.status).toBe(200);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/crm/companies/${companyId}`)
      .set(headers)
      .send({ name: 'Updated E2E Company' });
    expect(updateRes.status).toBe(200);

    const listRes = await request(app.getHttpServer()).get('/api/v1/crm/companies').set(headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/companies/${companyId}`)
      .set(headers);
    expect(deleteRes.status).toBe(200);
  });
});
