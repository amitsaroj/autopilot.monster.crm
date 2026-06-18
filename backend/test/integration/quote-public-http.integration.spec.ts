/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';

describe('HTTP E2E — public quote view', () => {
  let app: INestApplication;
  let postgresAvailable = false;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns 404 for unknown quote token', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer()).get(
      '/api/v1/crm/quotes/view/nonexistent-token-abc',
    );
    expect(response.status).toBe(404);
  });
});
