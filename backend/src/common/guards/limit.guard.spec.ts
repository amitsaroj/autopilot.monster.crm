import { ForbiddenException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { LimitGuard } from './limit.guard';
import { METADATA_KEYS } from '../constants/app.constants';

describe('LimitGuard', () => {
  const reflector = new Reflector();
  const pricingService = {
    getLimit: jest.fn(),
  };
  const billingService = {
    getUsage: jest.fn(),
    trackUsage: jest.fn(),
  };
  const moduleRef = {
    get: jest.fn((token: string) => {
      if (token === 'PricingService') return pricingService;
      if (token === 'BillingService') return billingService;
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
    expect(billingService.getUsage).not.toHaveBeenCalled();
  });

  it('blocks when configured limit is zero', async () => {
    pricingService.getLimit.mockResolvedValue(0);
    billingService.getUsage.mockResolvedValue(0);

    await expect(guard.canActivate(buildContext('deals_limit', 'tenant-1'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('blocks when usage reached configured limit', async () => {
    pricingService.getLimit.mockResolvedValue(100);
    billingService.getUsage.mockResolvedValue(100);

    await expect(
      guard.canActivate(buildContext('contacts_limit', 'tenant-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(pricingService.getLimit).toHaveBeenCalledWith('tenant-1', 'contacts_limit');
    expect(billingService.getUsage).toHaveBeenCalledWith('tenant-1', 'contacts_limit');
  });

  it('allows when usage is below configured limit', async () => {
    pricingService.getLimit.mockResolvedValue(100);
    billingService.getUsage.mockResolvedValue(42);

    await expect(guard.canActivate(buildContext('contacts_limit', 'tenant-1'))).resolves.toBe(true);
  });

  it('reads PLAN_LIMIT metadata key', async () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    await guard.canActivate(buildContext(undefined, 'tenant-1'));
    expect(spy).toHaveBeenCalledWith(METADATA_KEYS.PLAN_LIMIT, expect.any(Array));
  });
});
