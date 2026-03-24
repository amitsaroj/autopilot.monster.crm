import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { PricingService } from '../../modules/pricing/pricing.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly pricingService: PricingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string | undefined>(
      METADATA_KEYS.PLAN_FEATURE,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenant?.id;

    if (!tenantId) return false;

    const isEnabled = await this.pricingService.isFeatureEnabled(tenantId, requiredFeature);

    if (!isEnabled) {
      throw new ForbiddenException({
        message: `Feature '${requiredFeature}' is not available on your plan`,
        code: ERROR_CODES.PLAN_FEATURE_DISABLED,
      });
    }

    return true;
  }
}
