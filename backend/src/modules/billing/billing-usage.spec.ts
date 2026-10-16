import { BillingService } from './billing.service';

describe('BillingService usage metering', () => {
  const usageRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    query: jest.fn(),
  };

  let service: BillingService;

  beforeEach(() => {
    service = new BillingService(
      {} as never,
      {} as never,
      {} as never,
      usageRepo as never,
      {} as never,
      {} as never,
      {
        get: jest.fn((key: string) => {
          if (key === 'app.stripe') {
            return { secretKey: 'sk_test_mock' };
          }
          return undefined;
        }),
      } as never,
    );
    jest.clearAllMocks();
  });

  it('creates a usage record when none exists for the period', async () => {
    usageRepo.query.mockResolvedValue([{ quantity: '1' }]);

    await expect(service.trackUsage('tenant-1', 'contacts_limit', 1, 'TOTAL')).resolves.toBe(1);

    expect(usageRepo.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (tenant_id, metric, period_start)'),
      ['tenant-1', 'contacts_limit', 1, new Date(0), new Date('2099-12-31T23:59:59.999Z')],
    );
  });

  it('increments an existing usage record for the period', async () => {
    usageRepo.query.mockResolvedValue([{ quantity: '11' }]);

    await expect(service.trackUsage('tenant-1', 'contacts_limit', 1, 'TOTAL')).resolves.toBe(11);

    expect(usageRepo.query).toHaveBeenCalledTimes(1);
  });

  it('returns zero when no usage record exists', async () => {
    usageRepo.findOne.mockResolvedValue(null);

    const usage = await service.getUsage('tenant-1', 'contacts_limit', 'TOTAL');

    expect(usage).toBe(0);
  });

  it('returns stored quantity for a metric', async () => {
    usageRepo.findOne.mockResolvedValue({ quantity: 42 });

    const usage = await service.getUsage('tenant-1', 'deals_limit', 'TOTAL');

    expect(usage).toBe(42);
  });

  it('builds usage breakdown from period records', async () => {
    usageRepo.find.mockResolvedValue([
      { metric: 'contacts_limit', quantity: 5 },
      { metric: 'deals_limit', quantity: 2 },
    ]);

    const breakdown = await service.getUsageBreakdown('tenant-1');

    expect(breakdown).toEqual({
      contacts_limit: 5,
      deals_limit: 2,
    });
  });
});
