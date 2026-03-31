import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';

/**
 * PlanGuard — checks @PlanFeature() metadata against the tenant's active plan.
 * Stub: real plan/feature lookup injected from billing module (build step 5-6).
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string | undefined>(
      METADATA_KEYS.PLAN_FEATURE,
      [context.getHandler(), context.getClass()],
    );

    if (requiredFeature === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: IRequestContext }>();
    const { planId } = request.user;

    // TODO: replace with real plan feature check via billing service in step 5
    if (planId === '' || planId === undefined) {
      throw new ForbiddenException({
        message: `Plan feature '${requiredFeature}' is not available on your current plan`,
        code: ERROR_CODES.PLAN_FEATURE_DISABLED,
      });
    }

    return true;
  }
}
