import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from '@autopilot/core/common/constants/app.constants';
import { ERROR_CODES } from '@autopilot/core/common/constants/error-codes.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) return true;
    return super.canActivate(context);
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
