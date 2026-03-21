import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';
import type { Request } from 'express';

/**
 * RolesGuard — checks @Roles() metadata against the authenticated user's roles.
 * Stub: full RBAC resolver lives in apps/rbac (build step 4).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(METADATA_KEYS.ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles === undefined || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: IRequestContext }>();
    const { roles } = request.user;

    const hasRole = requiredRoles.some((role) => roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException({
        message: 'Insufficient role',
        code: ERROR_CODES.FORBIDDEN,
      });
    }
    return true;
  }
}
