import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';
import type { Request } from 'express';
import { PricingService } from '../../modules/pricing/pricing.service';
import { BillingService } from '../../modules/billing/billing.service';
import type { UsagePeriod } from '../../modules/billing/usage-period.util';

/** Usage reserved by LimitGuard; UsageMeteringInterceptor releases it if the handler fails. */
export interface UsageReservation {
  metric: string;
  period: UsagePeriod;
}

export type LimitedRequest = Request & {
  user?: IRequestContext;
  usageReservation?: UsageReservation;
};

@Injectable()
export class LimitGuard implements CanActivate {
  private readonly logger = new Logger(LimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.getAllAndOverride<string | undefined>(METADATA_KEYS.PLAN_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!metric) {
      return true;
    }

    const request = context.switchToHttp().getRequest<LimitedRequest>();
    if (!request.user) return true;

    const { tenantId } = request.user;
    if (!tenantId) return false;

    try {
      const pricingService = this.moduleRef.get(PricingService, { strict: false });
      const billingService = this.moduleRef.get(BillingService, { strict: false });

      const limit = await pricingService.getLimit(tenantId, metric);
      if (limit === -1) return true;

      // Check-and-increment in one statement so concurrent requests cannot overshoot.
      const period = await pricingService.getLimitPeriod(tenantId, metric);
      const reserved = await billingService.reserveUsage(tenantId, metric, 1, period, limit);
      if (!reserved) {
        throw new ForbiddenException({
          message: `Usage limit reached for '${metric}' (limit ${limit})`,
          code: ERROR_CODES.USAGE_LIMIT_EXCEEDED,
        });
      }
      request.usageReservation = { metric, period };
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      // Fail closed: an unverifiable limit must not grant unmetered usage.
      this.logger.error(`Usage limit check failed for '${metric}' (tenant ${tenantId})`, error);
      throw new ServiceUnavailableException({
        message: `Usage limit check for '${metric}' is temporarily unavailable`,
        code: ERROR_CODES.USAGE_LIMIT_EXCEEDED,
      });
    }
  }
}
