/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — RBAC (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated RBAC roles with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/rbac/roles');
    expect(response.status).toBe(401);
  });

  it('GET /rbac/permissions returns permission matrix', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/rbac/permissions')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('GET /rbac/roles returns tenant roles', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/rbac/roles')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    const roles = extractResponseData<Array<{ name: string }>>(response.body);
    expect(roles.some((r) => r.name === 'TENANT_ADMIN')).toBe(true);
  });
});
