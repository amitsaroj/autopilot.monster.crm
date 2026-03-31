import { METADATA_KEYS } from '../../../common/constants/app.constants';
import { ERROR_CODES } from '../../../common/constants/error-codes.constants';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

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
