/** @jest-environment node */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { createTestApp, isMinioReachable, isPostgresReachable } from '../e2e/helpers/app-test.helper';
import { seedTestCredentials } from '../e2e/helpers/seed-test.helper';

async function waitForJob(
  app: INestApplication,
  tenantId: string,
  path: string,
  jobId: string,
  timeoutMs = 30000,
): Promise<Record<string, unknown>> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/${path}/${jobId}`)
      .set('x-tenant-id', tenantId);

    const job = res.body.data as Record<string, unknown>;
    if (job?.status === 'COMPLETED') {
      return job;
    }
    if (job?.status === 'FAILED') {
      throw new Error(String(job.errorMessage ?? 'Job failed'));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Job ${jobId} did not complete in time`);
}

describe('HTTP E2E — import/export with MinIO', () => {
  let app: INestApplication;
  let postgresAvailable = false;
  let minioAvailable = false;
  let tenantId: string;

  beforeAll(async () => {
    postgresAvailable = await isPostgresReachable();
    minioAvailable = await isMinioReachable();
    if (!postgresAvailable || !minioAvailable) {
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

  it('imports contacts from CSV and exports them', async () => {
    if (!postgresAvailable || !minioAvailable) {
      return;
    }

    const csv = 'firstName,lastName,email\nImport,User,import-e2e@example.com\n';
    const uploadRes = await request(app.getHttpServer())
      .post('/api/v1/storage/files/upload')
      .set('x-tenant-id', tenantId)
      .send({ filename: 'contacts.csv', mimeType: 'text/csv' });

    expect(uploadRes.status).toBe(200);
    const { uploadUrl, fileKey } = uploadRes.body.data as { uploadUrl: string; fileKey: string };
    expect(fileKey).toBeDefined();

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: csv,
      headers: { 'Content-Type': 'text/csv' },
    });
    expect(putRes.ok).toBe(true);

    const importRes = await request(app.getHttpServer())
      .post('/api/v1/import')
      .set('x-tenant-id', tenantId)
      .send({ entityType: 'contacts', fileKey });

    expect([200, 202]).toContain(importRes.status);
    const importJobId = importRes.body.data?.id as string;
    expect(importJobId).toBeDefined();

    const importJob = await waitForJob(app, tenantId, 'import', importJobId);
    expect(importJob.status).toBe('COMPLETED');

    const exportRes = await request(app.getHttpServer())
      .post('/api/v1/export')
      .set('x-tenant-id', tenantId)
      .send({ entityType: 'contacts', format: 'csv' });

    expect([200, 202]).toContain(exportRes.status);
    const exportJobId = exportRes.body.data?.id as string;
    expect(exportJobId).toBeDefined();

    const exportJob = await waitForJob(app, tenantId, 'export', exportJobId);
    expect(exportJob.status).toBe('COMPLETED');
    expect(exportJob.downloadUrl ?? exportJob.fileKey).toBeDefined();
  });
});
