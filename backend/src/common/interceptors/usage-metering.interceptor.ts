import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

import { METADATA_KEYS } from '../constants/app.constants';
import { BillingService } from '../../modules/billing/billing.service';
import { PricingService } from '../../modules/pricing/pricing.service';

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

    const request = context.switchToHttp().getRequest<{ user?: { tenantId?: string } }>();
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      return next.handle();
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
      await this.billingService.trackUsage(tenantId, metric, 1, period);
    } catch (error) {
      this.logger.warn(`Failed to record usage for ${metric} (tenant ${tenantId})`, error);
    }
  }
}
