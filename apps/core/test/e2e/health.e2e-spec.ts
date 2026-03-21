import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { CoreModule } from '../../src/app.module';

/**
 * e2e Health Probe Tests
 * Requires real infra (Postgres, Redis) — use docker-compose.test.yml
 * or skip with: jest --testPathPattern=e2e --testNamePattern="skip"
 */
describe('Health e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health — should return 200 or 503', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');
    expect([200, 503]).toContain(response.status);
  });

  it('GET /api/v1/health/ready — should return 200 or 503', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health/ready');
    expect([200, 503]).toContain(response.status);
  });
});
