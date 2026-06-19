/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — WhatsApp platform', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let tenantId: string;
  let accessToken: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    const credentials = await seedTestCredentials();
    tenantId = credentials.tenantId;
    accessToken = await loginTestUser(app, credentials);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/whatsapp/conversations returns list', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/whatsapp/conversations')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('creates template, broadcast, sends message, assigns and resolves conversation', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);
    const phone = `1555${Date.now().toString().slice(-7)}`;

    const templateRes = await request(app.getHttpServer())
      .post('/api/v1/whatsapp/templates')
      .set(headers)
      .send({
        name: `test_template_${Date.now()}`,
        category: 'UTILITY',
        language: 'en_US',
        components: { components: [{ type: 'BODY', text: 'Hello {{firstName}}' }] },
      });

    expect([200, 201]).toContain(templateRes.status);
    const templateId = extractResponseData<{ id: string }>(templateRes.body).id;

    const broadcastRes = await request(app.getHttpServer())
      .post('/api/v1/whatsapp/broadcasts')
      .set(headers)
      .send({ name: 'Test Broadcast', templateId });

    expect([200, 201]).toContain(broadcastRes.status);

    const sendRes = await request(app.getHttpServer())
      .post(`/api/v1/whatsapp/conversations/${phone}/messages`)
      .set(headers)
      .send({ message: 'Integration test message' });

    expect([200, 201]).toContain(sendRes.status);

    const conversationRes = await request(app.getHttpServer())
      .get(`/api/v1/whatsapp/conversations/${phone}`)
      .set(headers);

    expect(conversationRes.status).toBe(200);
    const messages = extractResponseData<unknown[]>(conversationRes.body);
    expect(messages.length).toBeGreaterThan(0);

    const assignRes = await request(app.getHttpServer())
      .post(`/api/v1/whatsapp/conversations/${phone}/assign`)
      .set(headers)
      .send({ assigneeId: tenantId });

    expect(assignRes.status).toBe(200);

    const resolveRes = await request(app.getHttpServer())
      .post(`/api/v1/whatsapp/conversations/${phone}/resolve`)
      .set(headers);

    expect(resolveRes.status).toBe(200);

    const analyticsRes = await request(app.getHttpServer())
      .get('/api/v1/analytics/whatsapp')
      .set(headers);

    expect(analyticsRes.status).toBe(200);
    expect(extractResponseData<{ total: number }>(analyticsRes.body).total).toBeGreaterThan(0);
  });

  it('POST /api/v1/whatsapp/webhook accepts dev payload without signature', async () => {
    if (!postgresAvailable) {
      return;
    }

    process.env.DEFAULT_TENANT_ID = tenantId;

    const response = await request(app.getHttpServer())
      .post('/api/v1/whatsapp/webhook')
      .set('x-tenant-id', tenantId)
      .send({
        entry: [
          {
            changes: [
              {
                value: {
                  metadata: { display_phone_number: '15550001111' },
                  messages: [{ from: '15559998888', id: 'wamid.test', type: 'text', text: { body: 'Webhook hello' } }],
                },
              },
            ],
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
