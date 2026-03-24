import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import { HEADERS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';

/**
 * TenantGuard — ensures x-tenant-id header or JWT tenantId is present and matches.
 * Prevents cross-tenant data access.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user: IRequestContext }>();

    const headerTenantId = request.headers[HEADERS.TENANT_ID] as string | undefined;
    const jwtTenantId = request.user?.tenantId;

    if (jwtTenantId === '' || jwtTenantId === undefined) {
      throw new UnauthorizedException({
        message: 'Tenant context is missing',
        code: ERROR_CODES.TENANT_NOT_FOUND,
      });
    }

    // If header is provided, it must match JWT tenantId
    if (headerTenantId !== undefined && headerTenantId !== jwtTenantId) {
      throw new UnauthorizedException({
        message: 'Tenant ID mismatch',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    return true;
  }
}
