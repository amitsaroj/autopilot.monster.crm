/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — CRM contact CRUD', () => {
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

  it('creates, reads, updates, and deletes a contact', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/contacts')
      .set(headers)
      .send({
        firstName: 'E2E',
        lastName: 'Contact',
        email: `e2e-contact-${Date.now()}@example.com`,
        phone: '+15551234567',
      });

    expect([200, 201]).toContain(createRes.status);
    const contactId = extractResponseData<{ id: string }>(createRes.body).id;
    expect(contactId).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/contacts/${contactId}`)
      .set(headers);

    expect(getRes.status).toBe(200);

    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/crm/contacts/${contactId}`)
      .set(headers)
      .send({ firstName: 'E2EUpdated' });

    expect(updateRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/contacts/${contactId}`)
      .set(headers);

    expect(deleteRes.status).toBe(200);
  });

  it('GET /api/v1/crm/contacts returns tenant-scoped list', async () => {
    if (!postgresAvailable) {
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/crm/contacts')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(extractResponseData(response.body))).toBe(true);
  });

  it('creates, reads, and deletes a task', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/tasks')
      .set(headers)
      .send({ title: 'E2E Task', priority: 'HIGH', status: 'OPEN' });

    expect([200, 201]).toContain(createRes.status);
    const taskId = extractResponseData<{ id: string }>(createRes.body).id;
    expect(taskId).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/crm/tasks/${taskId}`)
      .set(headers);

    expect(getRes.status).toBe(200);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/tasks/${taskId}`)
      .set(headers);

    expect(deleteRes.status).toBe(200);
  });

  it('creates and deletes a note', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/crm/notes')
      .set(headers)
      .send({ title: 'E2E Note', content: 'Test content' });

    expect([200, 201]).toContain(createRes.status);
    const noteId = extractResponseData<{ id: string }>(createRes.body).id;
    expect(noteId).toBeDefined();

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/crm/notes/${noteId}`)
      .set(headers);

    expect(deleteRes.status).toBe(200);
  });
});
