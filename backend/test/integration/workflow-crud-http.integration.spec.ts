/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';

describe('HTTP E2E — Workflow CRUD', () => {
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

  it('creates, reads, updates, and deletes a workflow', async () => {
    if (!postgresAvailable) {
      return;
    }

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/workflows')
      .set('x-tenant-id', tenantId)
      .send({
        name: 'E2E Workflow',
        type: 'voice',
        definition: { nodes: [], edges: [] },
      });

    expect([200, 201]).toContain(createRes.status);
    const workflowId = createRes.body.data?.id;
    expect(workflowId).toBeDefined();

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/workflows/${workflowId}`)
      .set('x-tenant-id', tenantId);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.name).toBe('E2E Workflow');

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/workflows/${workflowId}`)
      .set('x-tenant-id', tenantId)
      .send({ name: 'E2E Workflow Updated' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('E2E Workflow Updated');

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/workflows')
      .set('x-tenant-id', tenantId);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/workflows/${workflowId}`)
      .set('x-tenant-id', tenantId);

    expect(deleteRes.status).toBe(200);
  });
});
