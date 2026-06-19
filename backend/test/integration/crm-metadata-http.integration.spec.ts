/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM metadata (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('GET /crm/dashboard returns dashboard metrics', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/crm/dashboard')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(extractResponseData(response.body)).toBeDefined();
  });

  it('manages tags lifecycle', async () => {
    if (!ctx.postgresAvailable) return;

    const createRes = await request(ctx.app.getHttpServer())
      .post('/api/v1/crm/tags')
      .set(ctx.headers)
      .send({ name: `tag-${Date.now()}`, color: '#3366ff' });

    expect([200, 201]).toContain(createRes.status);
    const tagId = extractResponseData<{ id: string }>(createRes.body).id;

    const listRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/crm/tags')
      .set(ctx.headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(ctx.app.getHttpServer())
      .delete(`/api/v1/crm/tags/${tagId}`)
      .set(ctx.headers);
    expect(deleteRes.status).toBe(200);
  });

  it('manages segments lifecycle', async () => {
    if (!ctx.postgresAvailable) return;

    const createRes = await request(ctx.app.getHttpServer())
      .post('/api/v1/crm/segments')
      .set(ctx.headers)
      .send({ name: `segment-${Date.now()}`, filters: { status: 'ACTIVE' } });

    expect([200, 201]).toContain(createRes.status);
    const segmentId = extractResponseData<{ id: string }>(createRes.body).id;

    const listRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/crm/segments')
      .set(ctx.headers);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(ctx.app.getHttpServer())
      .delete(`/api/v1/crm/segments/${segmentId}`)
      .set(ctx.headers);
    expect(deleteRes.status).toBe(200);
  });

  it('manages custom fields lifecycle', async () => {
    if (!ctx.postgresAvailable) return;

    const fieldKey = `field_${Date.now()}`;
    const createRes = await request(ctx.app.getHttpServer())
      .post('/api/v1/crm/custom-fields')
      .set(ctx.headers)
      .send({
        name: 'E2E Field',
        fieldKey,
        entityType: 'CONTACT',
        fieldType: 'TEXT',
      });

    expect([200, 201]).toContain(createRes.status);
    const fieldId = extractResponseData<{ id: string }>(createRes.body).id;

    const getRes = await request(ctx.app.getHttpServer())
      .get(`/api/v1/crm/custom-fields/${fieldId}`)
      .set(ctx.headers);
    expect(getRes.status).toBe(200);

    const deleteRes = await request(ctx.app.getHttpServer())
      .delete(`/api/v1/crm/custom-fields/${fieldId}`)
      .set(ctx.headers);
    expect(deleteRes.status).toBe(200);
  });

  it('GET /crm/forecast endpoints return forecast data', async () => {
    if (!ctx.postgresAvailable) return;

    const paths = ['forecast', 'forecast/by-stage', 'forecast/by-owner'] as const;

    for (const path of paths) {
      const response = await request(ctx.app.getHttpServer())
        .get(`/api/v1/crm/${path}`)
        .set(ctx.headers);
      expect(response.status).toBe(200);
    }
  });
});
