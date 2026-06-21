/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — CRM reports (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  const reportPaths = [
    'summary',
    'pipeline',
    'revenue-trend',
    'performance',
    'lead-funnel',
  ] as const;

  it.each(reportPaths)('GET /crm/reports/%s returns 200', async (path) => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get(`/api/v1/crm/reports/${path}`)
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(extractResponseData(response.body)).toBeDefined();
  });

  it('rejects unauthenticated CRM report with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/crm/reports/summary');
    expect(response.status).toBe(401);
  });
});
