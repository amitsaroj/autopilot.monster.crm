import { INestApplication } from '@nestjs/common';

import { createTestApp, isPostgresReachable } from './app-test.helper';
import { seedTestCredentials } from './seed-test.helper';
import { authRequestHeaders, loginTestUser } from './auth-test.helper';

export interface SecuredHttpTestContext {
  app: INestApplication;
  tenantId: string;
  accessToken: string;
  headers: Record<string, string>;
  postgresAvailable: true;
}

export type SecuredHttpBootstrapResult =
  | SecuredHttpTestContext
  | { postgresAvailable: false };

export async function bootstrapSecuredHttpTest(): Promise<SecuredHttpBootstrapResult> {
  const postgresAvailable = await isPostgresReachable();
  if (!postgresAvailable) {
    return { postgresAvailable: false };
  }

  process.env.DB_SYNCHRONIZE = 'true';
  const app = await createTestApp();
  const credentials = await seedTestCredentials();
  const accessToken = await loginTestUser(app, credentials);

  return {
    app,
    tenantId: credentials.tenantId,
    accessToken,
    headers: authRequestHeaders(credentials.tenantId, accessToken),
    postgresAvailable: true,
  };
}

export async function closeSecuredHttpTest(app: INestApplication | undefined): Promise<void> {
  if (app) {
    await app.close();
  }
}
