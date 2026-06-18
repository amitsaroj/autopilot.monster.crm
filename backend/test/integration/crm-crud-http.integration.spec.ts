/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';

describe('HTTP E2E — CRM contact CRUD', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let tenantId: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    if (!postgresAvailable) {
      return;
    }

    process.env.DB_SYNCHRONIZE = 'true';
    app = await createTestApp();
    const credentials = await seedTestCredentials();
    tenantId = credentials.tenantId;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates, reads, updates, and deletes a contact', async () => {
    if (!postgresAvailable) {
      return;
    }

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/contacts')
      .set('x-tenant-id', tenantId)
      .send({
        firstName: 'E2E',
        lastName: 'Contact',
        email: `e2e-contact-${Date.now()}@example.com`,
        phone: '+15551234567',
      });

    expect([200, 201]).toContain(createRes.status);
    const contactId = createRes.body.data?.id ?? createRes.body.id;
    expect(contactId).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/contacts/${contactId}`)
      .set('x-tenant-id', tenantId);

    expect(getRes.status).toBe(200);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/crm/contacts/${contactId}`)
      .set('x-tenant-id', tenantId)
      .send({ firstName: 'E2EUpdated' });

    expect(updateRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/contacts/${contactId}`)
      .set('x-tenant-id', tenantId);

    expect(deleteRes.status).toBe(200);
  });

  it('GET /api/v1/crm/contacts returns tenant-scoped list', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/crm/contacts')
      .set('x-tenant-id', tenantId);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
