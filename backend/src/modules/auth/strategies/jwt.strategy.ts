import type { IRequestContext } from '../../../common/interfaces/request-context.interface';
import type { JwtConfig } from '../../../config/jwt.config';
import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const jwt = configService.get<JwtConfig>('jwt');
    if (jwt === undefined || jwt.secret === '') {
      throw new Error('JWT secret is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret,
    });
  }

  validate(payload: JwtPayload): IRequestContext {
    if (payload.sub === undefined || payload.tenantId === undefined) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
      permissions: payload.permissions,
      planId: payload.planId,
      correlationId: '',
      ipAddress: '',
      userAgent: '',
    };
  }
}
