import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { HEADERS, METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';

/**
 * TenantGuard — ensures x-tenant-id header or JWT tenantId is present and matches.
 * Prevents cross-tenant data access.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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

    // Force verified tenant ID onto headers to prevent bypasses in downstream logic
    request.headers[HEADERS.TENANT_ID] = jwtTenantId;

    return true;
  }
}
