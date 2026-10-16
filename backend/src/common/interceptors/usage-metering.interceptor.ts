import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

import { METADATA_KEYS } from '../constants/app.constants';
import type { LimitedRequest } from '../guards/limit.guard';
import { BillingService } from '../../modules/billing/billing.service';
import { PricingService } from '../../modules/pricing/pricing.service';
import type { UsagePeriod } from '../../modules/billing/usage-period.util';

@Injectable()
export class UsageMeteringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UsageMeteringInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly billingService: BillingService,
    private readonly pricingService: PricingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metric = this.reflector.getAllAndOverride<string | undefined>(METADATA_KEYS.PLAN_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (metric === undefined) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<LimitedRequest>();
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      return next.handle();
    }

    const reservation = request.usageReservation;
    if (reservation) {
      // LimitGuard already counted this request atomically; give it back if the handler fails.
      return next.handle().pipe(
        tap({
          error: () => {
            void this.adjustUsage(tenantId, reservation.metric, -1, reservation.period);
          },
        }),
      );
    }

    return next.handle().pipe(
      tap(() => {
        void this.recordUsage(tenantId, metric);
      }),
    );
  }

  private async recordUsage(tenantId: string, metric: string): Promise<void> {
    try {
      const period = await this.pricingService.getLimitPeriod(tenantId, metric);
      await this.adjustUsage(tenantId, metric, 1, period);
    } catch (error) {
      this.logger.warn(`Failed to record usage for ${metric} (tenant ${tenantId})`, error);
    }
  }

  private async adjustUsage(
    tenantId: string,
    metric: string,
    quantity: number,
    period: UsagePeriod,
  ): Promise<void> {
    try {
      await this.billingService.trackUsage(tenantId, metric, quantity, period);
    } catch (error) {
      this.logger.warn(`Failed to adjust usage for ${metric} (tenant ${tenantId})`, error);
    }
  }
}
