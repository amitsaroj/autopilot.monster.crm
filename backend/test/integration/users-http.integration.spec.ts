/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Users (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated user list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/users');
    expect(response.status).toBe(401);
  });

  it('GET /users and /users/me return team data', async () => {
    if (!ctx.postgresAvailable) return;

    const listRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/users')
      .set(ctx.headers);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(listRes.body))).toBe(true);

    const meRes = await request(ctx.app.getHttpServer())
      .get('/api/v1/users/me')
      .set(ctx.headers);
    expect(meRes.status).toBe(200);
    expect(extractResponseData<{ email: string }>(meRes.body).email).toBeDefined();
  });

  it('GET /users/groups returns team groups', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/users/groups')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });
});
