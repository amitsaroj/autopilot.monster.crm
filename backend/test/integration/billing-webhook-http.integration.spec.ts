/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';

describe('HTTP E2E — billing Stripe webhook', () => {
  let app: INestApplication;
  let postgresAvailable = false;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_e2e_placeholder_secret';
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects webhook without stripe-signature header', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/api/v1/billing/webhook')
      .set('Content-Type', 'application/json')
      .send({ type: 'invoice.paid' });

    expect(response.status).toBe(400);
    expect(String(response.body.message ?? response.body.data?.message ?? '')).toMatch(
      /signature/i,
    );
  });

  it('rejects webhook with invalid stripe signature', async () => {
    if (!postgresAvailable) {
      return;
    }

    const payload = JSON.stringify({ id: 'evt_test', type: 'invoice.paid', data: { object: {} } });

    const response = await request(app.getHttpServer())
      .post('/api/v1/billing/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=0,v1=invalid_signature_value')
      .send(payload);

    expect(response.status).toBe(400);
    expect(String(response.body.message ?? '')).toMatch(/webhook/i);
  });
});
