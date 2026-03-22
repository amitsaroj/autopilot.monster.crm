import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { HEADERS } from '../constants/app.constants';

/**
 * @TenantId() — extracts tenantId from x-tenant-id header or JWT payload.
 */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: { tenantId: string } }>();
    return request.user?.tenantId ?? (request.headers[HEADERS.TENANT_ID] as string) ?? '';
  },
);
