import { BillingService } from './billing.service';

describe('BillingService usage metering', () => {
  const usageRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
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
    usageRepo.findOne.mockResolvedValue(null);
    const created = { tenantId: 'tenant-1', metric: 'contacts_limit', quantity: 1 };
    usageRepo.create.mockReturnValue(created);
    usageRepo.save.mockResolvedValue(created);

    await service.trackUsage('tenant-1', 'contacts_limit', 1, 'TOTAL');

    expect(usageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        metric: 'contacts_limit',
        quantity: 1,
      }),
    );
    expect(usageRepo.save).toHaveBeenCalledWith(created);
  });

  it('increments an existing usage record for the period', async () => {
    const existing = { quantity: 10 };
    usageRepo.findOne.mockResolvedValue(existing);
    usageRepo.save.mockImplementation((record) => Promise.resolve(record));

    await service.trackUsage('tenant-1', 'contacts_limit', 1, 'TOTAL');

    expect(existing.quantity).toBe(11);
    expect(usageRepo.save).toHaveBeenCalledWith(existing);
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

    const breakdown = await service.getUsageBreakdown('tenant-1', 'TOTAL');

    expect(breakdown).toEqual({
      contacts_limit: 5,
      deals_limit: 2,
    });
  });
});
