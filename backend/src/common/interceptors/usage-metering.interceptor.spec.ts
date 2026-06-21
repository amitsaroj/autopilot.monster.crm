import { of } from 'rxjs';

import { UsageMeteringInterceptor } from './usage-metering.interceptor';
import { METADATA_KEYS } from '../constants/app.constants';

describe('UsageMeteringInterceptor', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const billingService = { trackUsage: jest.fn() };
  const pricingService = { getLimitPeriod: jest.fn() };
  const interceptor = new UsageMeteringInterceptor(
    reflector as never,
    billingService as never,
    pricingService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    pricingService.getLimitPeriod.mockResolvedValue('TOTAL');
    billingService.trackUsage.mockResolvedValue(undefined);
  });

  it('passes through when route has no limit metadata', (done) => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { tenantId: 'tenant-1' } }) }),
    } as never;

    interceptor.intercept(context, { handle: () => of({ ok: true }) }).subscribe({
      next: (value) => {
        expect(value).toEqual({ ok: true });
      },
      complete: () => {
        expect(billingService.trackUsage).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('records usage after successful handler completion', (done) => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === METADATA_KEYS.PLAN_LIMIT ? 'contacts_limit' : undefined,
    );
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { tenantId: 'tenant-1' } }) }),
    } as never;

    interceptor.intercept(context, { handle: () => of({ status: 201 }) }).subscribe({
      complete: async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(pricingService.getLimitPeriod).toHaveBeenCalledWith('tenant-1', 'contacts_limit');
        expect(billingService.trackUsage).toHaveBeenCalledWith('tenant-1', 'contacts_limit', 1, 'TOTAL');
        done();
      },
    });
  });
});
