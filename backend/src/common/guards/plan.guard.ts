import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';
import { PricingService } from '../../modules/pricing/pricing.service';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly pricingService: PricingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const requiredFeature = this.reflector.getAllAndOverride<string | undefined>(
      METADATA_KEYS.PLAN_FEATURE,
      [context.getHandler(), context.getClass()],
    );

    if (requiredFeature === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: IRequestContext }>();
    const { tenantId, roles } = request.user;

    if (roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const enabled = await this.pricingService.isFeatureEnabled(tenantId, requiredFeature);
    if (!enabled) {
      throw new ForbiddenException({
        message: `Plan feature '${requiredFeature}' is not available on your current plan`,
        code: ERROR_CODES.PLAN_FEATURE_DISABLED,
      });
    }

    return true;
  }
}
