import request from 'supertest';
import { INestApplication } from '@nestjs/common';

import type { TestCredentials } from './seed-test.helper';

export interface AuthenticatedTestContext extends TestCredentials {
  accessToken: string;
}

export async function loginTestUser(
  app: INestApplication,
  credentials: TestCredentials,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .set('x-tenant-id', credentials.tenantId)
    .send({ email: credentials.email, password: credentials.password });

  if (response.status !== 200) {
    throw new Error(`Test login failed (${response.status}): ${JSON.stringify(response.body)}`);
  }

  return response.body.data.accessToken as string;
}

export function authRequestHeaders(
  tenantId: string,
  accessToken: string,
): Record<string, string> {
  return {
    'x-tenant-id': tenantId,
    Authorization: `Bearer ${accessToken}`,
  };
}

export function extractResponseData<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): T {
  const outer = body.data;
  if (outer && typeof outer === 'object' && outer !== null && 'data' in outer) {
    return (outer as { data: T }).data;
  }
  return outer as T;
}
