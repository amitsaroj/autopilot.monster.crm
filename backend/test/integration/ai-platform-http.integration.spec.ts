/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';
import { authRequestHeaders, extractResponseData, loginTestUser } from '../e2e/helpers/auth-test.helper';

describe('HTTP Integration — AI Platform', () => {
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

  it('GET /api/v1/ai/models returns model list', async () => {
    if (!postgresAvailable) return;

    const response = await request(app.getHttpServer())
      .get('/api/v1/ai/models')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    const models = extractResponseData<Array<{ id: string }>>(response.body);
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
  });

  it('CRUD AI agents and prompts', async () => {
    if (!postgresAvailable) return;

    const headers = authRequestHeaders(tenantId, accessToken);

    const agentRes = await request(app.getHttpServer())
      .post('/api/v1/ai/agents')
      .set(headers)
      .send({ name: 'Audit Test Agent', systemPrompt: 'You are helpful.' });

    expect([200, 201]).toContain(agentRes.status);
    const agent = extractResponseData<{ id: string; name: string }>(agentRes.body);
    expect(agent.id).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/ai/agents')
      .set(headers);
    expect(listRes.status).toBe(200);

    const promptRes = await request(app.getHttpServer())
      .post('/api/v1/ai/prompts')
      .set(headers)
      .send({ name: 'Audit Prompt', content: 'Summarize {{contact.name}}' });

    expect([200, 201]).toContain(promptRes.status);
    const prompt = extractResponseData<{ id: string }>(promptRes.body);
    expect(prompt.id).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/api/v1/ai/agents/${agent.id}`)
      .set(headers);

    await request(app.getHttpServer())
      .delete(`/api/v1/ai/prompts/${prompt.id}`)
      .set(headers);
  });

  it('Knowledge base lifecycle', async () => {
    if (!postgresAvailable) return;

    const headers = authRequestHeaders(tenantId, accessToken);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/ai/knowledge-bases')
      .set(headers)
      .send({ name: 'Audit KB', sourceType: 'FILE' });

    expect([200, 201]).toContain(createRes.status);
    const kb = extractResponseData<{ id: string; name: string }>(createRes.body);
    expect(kb.id).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/ai/knowledge-bases')
      .set(headers);
    expect(listRes.status).toBe(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/ai/knowledge-bases/${kb.id}`)
      .set(headers);
  });

  it('GET /api/v1/ai/usage returns usage metrics', async () => {
    if (!postgresAvailable) return;

    const response = await request(app.getHttpServer())
      .get('/api/v1/ai/usage')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    const usage = extractResponseData<{ tokensUsed: number; cost: number }>(response.body);
    expect(typeof usage.tokensUsed).toBe('number');
    expect(typeof usage.cost).toBe('number');
  });

  it('GET /api/v1/ai/conversations returns paginated list', async () => {
    if (!postgresAvailable) return;

    const response = await request(app.getHttpServer())
      .get('/api/v1/ai/conversations')
      .set(authRequestHeaders(tenantId, accessToken));

    expect(response.status).toBe(200);
    const data = extractResponseData<{ items: unknown[]; total: number }>(response.body);
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.total).toBe('number');
  });
});
