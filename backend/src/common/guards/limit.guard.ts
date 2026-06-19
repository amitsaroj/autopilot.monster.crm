import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';

import { METADATA_KEYS } from '../constants/app.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IRequestContext } from '../interfaces/request-context.interface';
import type { Request } from 'express';

@Injectable()
export class LimitGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest<{ user?: { tenantId?: string } }>();
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      return true;
    }

    const limit = await this.pricingService.getLimit(tenantId, metric);
    if (limit === -1) return true;
    if (limit <= 0) return true;

    const period = await this.pricingService.getLimitPeriod(tenantId, metric);
    const usage = await this.billingService.getUsage(tenantId, metric, period);
    const allowed = usage < limit;

        const usage = await billingService.getUsage(tenantId, metric);
        const allowed = usage < limit;

        if (!allowed) {
          throw new ForbiddenException({
            message: `Usage limit reached for '${metric}' (${usage}/${limit})`,
            code: ERROR_CODES.USAGE_LIMIT_EXCEEDED,
          });
        }
      }
    } catch (e: any) {
      if (e instanceof ForbiddenException) throw e;
      // If services are not yet loaded, allow pass-through or handle gracefully
    }

    return true;
  }
}
