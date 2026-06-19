/** @jest-environment node */
import request from 'supertest';

import {
  bootstrapSecuredHttpTest,
  closeSecuredHttpTest,
  type SecuredHttpTestContext,
} from '../e2e/helpers/secured-http-test.helper';

const PROTECTED_ROUTES = [
  { method: 'get' as const, path: '/api/v1/crm/deals' },
  { method: 'get' as const, path: '/api/v1/crm/companies' },
  { method: 'get' as const, path: '/api/v1/crm/leads' },
  { method: 'get' as const, path: '/api/v1/analytics/overview' },
  { method: 'get' as const, path: '/api/v1/notifications' },
  { method: 'get' as const, path: '/api/v1/voice/calls' },
  { method: 'get' as const, path: '/api/v1/whatsapp/conversations' },
  { method: 'get' as const, path: '/api/v1/ai/agents' },
  { method: 'get' as const, path: '/api/v1/billing/subscription' },
  { method: 'get' as const, path: '/api/v1/search' },
  { method: 'get' as const, path: '/api/v1/support/tickets' },
  { method: 'get' as const, path: '/api/v1/social/posts' },
  { method: 'get' as const, path: '/api/v1/marketplace/installed' },
  { method: 'get' as const, path: '/api/v1/settings/workspace' },
  { method: 'get' as const, path: '/api/v1/monetization/subscription' },
  { method: 'get' as const, path: '/api/v1/rbac/roles' },
  { method: 'get' as const, path: '/api/v1/users' },
  { method: 'get' as const, path: '/api/v1/scheduler' },
  { method: 'get' as const, path: '/api/v1/backup' },
  { method: 'get' as const, path: '/api/v1/usage' },
] as const;

describe('HTTP E2E — multi-module auth rejection (secured)', () => {
  let ctx: SecuredHttpTestContext | { postgresAvailable: false };

  beforeAll(async () => {
    ctx = await bootstrapSecuredHttpTest();
  });

  afterAll(async () => {
    if (ctx.postgresAvailable) {
      await closeSecuredHttpTest(ctx.app);
    }
  });

  it.each(PROTECTED_ROUTES)('$method $path returns 401 without JWT', async ({ method, path }) => {
    if (!ctx.postgresAvailable) return;

    const response = await request(ctx.app.getHttpServer())[method](path);
    expect(response.status).toBe(401);
  });
});
