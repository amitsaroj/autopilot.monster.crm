import { ForbiddenException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { LimitGuard } from './limit.guard';
import { METADATA_KEYS } from '../constants/app.constants';
import { PricingService } from '../../modules/pricing/pricing.service';
import { BillingService } from '../../modules/billing/billing.service';

describe('LimitGuard', () => {
  const reflector = new Reflector();
  const pricingService = {
    getLimit: jest.fn(),
    getLimitPeriod: jest.fn().mockResolvedValue('MONTHLY'),
  };
  const billingService = {
    reserveUsage: jest.fn(),
  };
  const moduleRef = {
    // Real DI resolves these by their class token (see limit.guard.ts) — keying
    // the mock on the string 'PricingService'/'BillingService' would silently
    // return undefined for both and make every test below pass for the wrong
    // reason (the guard falling through to its default `return true`).
    get: jest.fn((token: unknown) => {
      if (token === PricingService) return pricingService;
      if (token === BillingService) return billingService;
      return undefined;
    }),
  };

  let guard: LimitGuard;

  beforeEach(() => {
    guard = new LimitGuard(reflector, moduleRef as unknown as ModuleRef);
    jest.clearAllMocks();
  });

  function buildContext(metric?: string, tenantId?: string) {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(metric);
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: tenantId ? { tenantId } : undefined }),
      }),
    } as never;
  }

  it('allows requests without @Limit metadata', async () => {
    await expect(guard.canActivate(buildContext(undefined, 'tenant-1'))).resolves.toBe(true);
  });

  it('allows when configured limit is unlimited', async () => {
    pricingService.getLimit.mockResolvedValue(-1);
    await expect(guard.canActivate(buildContext('contacts_limit', 'tenant-1'))).resolves.toBe(true);
    expect(billingService.reserveUsage).not.toHaveBeenCalled();
  });

  it('blocks when configured limit is zero', async () => {
    pricingService.getLimit.mockResolvedValue(0);
    billingService.reserveUsage.mockResolvedValue(false);

    await expect(guard.canActivate(buildContext('deals_limit', 'tenant-1'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('blocks when usage reached configured limit', async () => {
    pricingService.getLimit.mockResolvedValue(100);
    billingService.reserveUsage.mockResolvedValue(false);

    await expect(
      guard.canActivate(buildContext('contacts_limit', 'tenant-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(pricingService.getLimit).toHaveBeenCalledWith('tenant-1', 'contacts_limit');
    expect(billingService.reserveUsage).toHaveBeenCalledWith(
      'tenant-1',
      'contacts_limit',
      1,
      'MONTHLY',
      100,
    );
  });

  it('allows when usage is below configured limit', async () => {
    pricingService.getLimit.mockResolvedValue(100);
    billingService.reserveUsage.mockResolvedValue(true);

    await expect(guard.canActivate(buildContext('contacts_limit', 'tenant-1'))).resolves.toBe(true);
  });

  it('reads PLAN_LIMIT metadata key', async () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    await guard.canActivate(buildContext(undefined, 'tenant-1'));
    expect(spy).toHaveBeenCalledWith(METADATA_KEYS.PLAN_LIMIT, expect.any(Array));
  });
});
