/** @jest-environment node */
import request from 'supertest';

import { extractResponseData } from '../e2e/helpers/auth-test.helper';
import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

describe('HTTP E2E — Storage files (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it('rejects unauthenticated file list with 401', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer()).get('/api/v1/storage/files');
    expect(response.status).toBe(401);
  });

  it('GET /storage/files returns tenant file list', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .get('/api/v1/storage/files')
      .set(ctx.headers);

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('POST /storage/files/upload returns presigned upload URL', async () => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())
      .post('/api/v1/storage/files/upload')
      .set(ctx.headers)
      .send({ filename: 'test-secured.txt', mimeType: 'text/plain' });

    expect(response.status).toBe(200);
    const payload = extractResponseData<{ uploadUrl: string; fileKey: string }>(response.body);
    expect(payload.uploadUrl).toBeDefined();
    expect(payload.fileKey).toBeDefined();
  });
});
