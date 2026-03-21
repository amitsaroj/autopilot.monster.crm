import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from '../constants/app.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';
import type { Request } from 'express';

/**
 * JwtAuthGuard — stub for core module.
 * Full implementation lives in apps/auth module (build step 2).
 * Reads IS_PUBLIC metadata to skip guard on public routes.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
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

    // In core only: pass-through. Auth module replaces this with full JWT validation.
    return request.user !== undefined;
  }
}
