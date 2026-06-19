/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP E2E — Workflow CRUD', () => {
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

  it('creates, reads, updates, and deletes a workflow', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/workflows')
      .set(headers)
      .send({
        name: 'E2E Workflow',
        type: 'voice',
        definition: { nodes: [], edges: [] },
      });

    expect([200, 201]).toContain(createRes.status);
    const workflowId = extractResponseData<{ id: string }>(createRes.body).id;
    expect(workflowId).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/workflows/${workflowId}`)
      .set(headers);

    expect(getRes.status).toBe(200);
    expect(extractResponseData<{ name: string }>(getRes.body).name).toBe('E2E Workflow');

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/workflows/${workflowId}`)
      .set(headers)
      .send({ name: 'E2E Workflow Updated' });

    expect(updateRes.status).toBe(200);
    expect(extractResponseData<{ name: string }>(updateRes.body).name).toBe('E2E Workflow Updated');

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/workflows')
      .set(headers);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(listRes.body))).toBe(true);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/workflows/${workflowId}`)
      .set(headers);

    expect(deleteRes.status).toBe(200);
  });

  it('lists workflow triggers and actions metadata', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const triggersRes = await request(app.getHttpServer())
      .get('/api/v1/workflows/workflow-triggers')
      .set(headers);

    expect(triggersRes.status).toBe(200);
    const triggers = extractResponseData<Array<{ key: string }>>(triggersRes.body);
    expect(Array.isArray(triggers)).toBe(true);
    expect(triggers.some((t) => t.key === 'CONTACT_CREATED')).toBe(true);

    const actionsRes = await request(app.getHttpServer())
      .get('/api/v1/workflows/workflow-actions')
      .set(headers);

    expect(actionsRes.status).toBe(200);
    const actions = extractResponseData<Array<{ key: string }>>(actionsRes.body);
    expect(Array.isArray(actions)).toBe(true);
    expect(actions.some((a) => a.key === 'SEND_EMAIL')).toBe(true);
    expect(actions.some((a) => a.key === 'INITIATE_CALL')).toBe(true);
  });

  it('returns workflow execution history', async () => {
    if (!postgresAvailable) {
      return;
    }

    const headers = authRequestHeaders(tenantId, accessToken);

    const execRes = await request(app.getHttpServer())
      .get('/api/v1/workflows/executions')
      .set(headers);

    expect(execRes.status).toBe(200);
    expect(Array.isArray(extractResponseData(execRes.body))).toBe(true);
  });
});
