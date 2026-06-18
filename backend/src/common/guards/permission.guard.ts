import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';

const METHOD_ACTION_MAP: Record<string, string> = {
  GET: 'read',
  HEAD: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: IRequestContext }>();
    const user = request.user;

    if (user?.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    let requiredPermissions = this.reflector.getAllAndOverride<string[] | undefined>(
      METADATA_KEYS.PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      const resource = this.reflector.getAllAndOverride<string | undefined>(
        METADATA_KEYS.PERMISSION_RESOURCE,
        [context.getHandler(), context.getClass()],
      );
      if (resource) {
        const method = request.method.toUpperCase();
        const action = METHOD_ACTION_MAP[method] ?? 'read';
        requiredPermissions = [`${resource}:${action}`];
      }
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const userPermissions: string[] = user?.permissions ?? [];

    const hasPermission = requiredPermissions.every((permission) =>
      this.userHasPermission(userPermissions, permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        message: 'Insufficient permissions to access this resource',
        code: ERROR_CODES.FORBIDDEN,
      });
    }

    return true;
  }

  private userHasPermission(userPermissions: string[], required: string): boolean {
    if (userPermissions.includes(required)) {
      return true;
    }

    const [resource, action] = required.split(':');
    if (userPermissions.includes(`${resource}:manage`)) {
      return true;
    }

    if (action === 'read' && userPermissions.includes(`${resource}:view`)) {
      return true;
    }

    return false;
  }
}
