import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isObservable, lastValueFrom } from 'rxjs';
import type { Request } from 'express';
import { ApiKeyAuthService } from '../../modules/auth/api-key-auth.service';
import type { IRequestContext } from '../interfaces/request-context.interface';

/**
 * JwtAuthGuard — global guard registered via APP_GUARD.
 * Uses passport-jwt strategy to validate Bearer tokens.
 * Routes decorated with @Public() bypass this guard.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) return true;
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: IRequestContext; apiKeyAuthenticated?: boolean }>();
    if (request.apiKeyAuthenticated) return true;
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader !== undefined) {
      if (typeof apiKeyHeader !== 'string' || !apiKeyHeader.trim()) {
        throw new UnauthorizedException({
          message: 'Invalid API key',
          code: ERROR_CODES.UNAUTHORIZED,
        });
      }
      const key = await this.moduleRef
        .get(ApiKeyAuthService, { strict: false })
        .authenticate(apiKeyHeader);
      if (!key) {
        throw new UnauthorizedException({
          message: 'Invalid API key',
          code: ERROR_CODES.UNAUTHORIZED,
        });
      }
      request.user = {
        userId: key.userId ?? key.id,
        tenantId: key.tenantId,
        email: '',
        roles: [],
        permissions: key.permissions ?? [],
        planId: '',
        correlationId: '',
        ipAddress: request.ip ?? '',
        userAgent: request.get('user-agent') ?? '',
      };
      request.apiKeyAuthenticated = true;
      return true;
    }
    const activation = super.canActivate(context);
    return isObservable(activation) ? lastValueFrom(activation) : activation;
  }

  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
    if (err !== null || user === false) {
      throw new UnauthorizedException({
        message: 'Authentication required',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }
    return user;
  }
}
