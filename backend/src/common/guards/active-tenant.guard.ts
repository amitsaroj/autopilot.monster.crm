import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';
import { TenantService } from '../../modules/tenant/tenant.service';

@Injectable()
export class ActiveTenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantService: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: IRequestContext }>();
    const tenantId = request.user?.tenantId;
    const roles = request.user?.roles ?? [];

    if (!tenantId || roles.includes('SUPER_ADMIN')) {
      return true;
    }

    let tenant;
    try {
      tenant = await this.tenantService.findOne(tenantId);
    } catch {
      throw new UnauthorizedException({
        message: 'Tenant not found',
        code: ERROR_CODES.TENANT_NOT_FOUND,
      });
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException({
        message: 'Workspace is suspended',
        code: ERROR_CODES.TENANT_SUSPENDED,
      });
    }

    if (tenant.status === 'DELETED') {
      throw new ForbiddenException({
        message: 'Workspace is no longer available',
        code: ERROR_CODES.TENANT_NOT_FOUND,
      });
    }

    return true;
  }
}
