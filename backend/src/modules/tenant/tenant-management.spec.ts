jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Reflector } from '@nestjs/core';

import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';
import { PricingService } from '../pricing/pricing.service';
import { PricingRepository } from '../pricing/pricing.repository';
import { ActiveTenantGuard } from '../../common/guards/active-tenant.guard';
import { Tenant } from '../../database/entities/tenant.entity';
import { Subscription } from '../../database/entities/subscription.entity';

describe('TenantService', () => {
  let service: TenantService;

  const mockRepository = {
    findBySlug: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findAll: jest.fn(),
  };

  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: TenantRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get(TenantService);
    jest.clearAllMocks();
  });

  it('rejects duplicate slug on create', async () => {
    mockRepository.findBySlug.mockResolvedValue({ id: 'existing', slug: 'acme' });

    await expect(service.create({ name: 'Acme', slug: 'acme' })).rejects.toThrow(
      'Tenant with this slug already exists',
    );
  });

  it('emits tenant.suspended on suspend', async () => {
    mockRepository.findById.mockResolvedValue({ id: 't1', status: 'ACTIVE' });
    mockRepository.update.mockResolvedValue({ id: 't1', status: 'SUSPENDED' });

    await service.suspend('t1');

    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'tenant.suspended',
      expect.objectContaining({ tenantId: 't1' }),
    );
  });

  it('marks tenant deleted before soft delete', async () => {
    mockRepository.findById.mockResolvedValue({ id: 't1', status: 'ACTIVE' });
    mockRepository.update.mockResolvedValue(undefined);
    mockRepository.softDelete.mockResolvedValue(undefined);

    await service.remove('t1');

    expect(mockRepository.update).toHaveBeenCalledWith('t1', { status: 'DELETED' });
    expect(mockRepository.softDelete).toHaveBeenCalledWith('t1');
  });
});

describe('PricingService tenant overrides', () => {
  let service: PricingService;

  const mockPricingRepository = {
    findPlanFeatures: jest.fn(),
    findPlanLimits: jest.fn(),
  };

  const mockSubscriptionRepo = {
    findOne: jest.fn(),
  };

  const mockTenantRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PricingRepository, useValue: mockPricingRepository },
        { provide: getRepositoryToken(Subscription), useValue: mockSubscriptionRepo },
        { provide: getRepositoryToken(Tenant), useValue: mockTenantRepo },
      ],
    }).compile();

    service = module.get(PricingService);
    jest.clearAllMocks();
  });

  it('uses tenant feature override over plan feature', async () => {
    mockTenantRepo.findOne.mockResolvedValue({
      id: 't1',
      overrides: { features: { ai: false } },
    });
    mockSubscriptionRepo.findOne.mockResolvedValue({ tenantId: 't1', planId: 'p1', status: 'ACTIVE' });
    mockPricingRepository.findPlanFeatures.mockResolvedValue([
      { featureKey: 'ai', enabled: true },
    ]);

    await expect(service.isFeatureEnabled('t1', 'ai')).resolves.toBe(false);
  });

  it('uses tenant limit override over plan limit', async () => {
    mockTenantRepo.findOne.mockResolvedValue({
      id: 't1',
      overrides: { limits: { contacts: 5000 } },
    });
    mockSubscriptionRepo.findOne.mockResolvedValue({ tenantId: 't1', planId: 'p1', status: 'ACTIVE' });
    mockPricingRepository.findPlanLimits.mockResolvedValue([
      { metric: 'contacts', value: 1000 },
    ]);

    await expect(service.getLimit('t1', 'contacts')).resolves.toBe(5000);
  });
});

describe('ActiveTenantGuard', () => {
  let guard: ActiveTenantGuard;

  const mockTenantService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActiveTenantGuard,
        Reflector,
        { provide: TenantService, useValue: mockTenantService },
      ],
    }).compile();

    guard = module.get(ActiveTenantGuard);
    jest.clearAllMocks();
  });

  it('blocks suspended tenants', async () => {
    mockTenantService.findOne.mockResolvedValue({ id: 't1', status: 'SUSPENDED' });

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { tenantId: 't1', roles: ['USER'] } }),
      }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'TENANT_002' },
    });
  });

  it('allows super admin regardless of tenant status', async () => {
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { tenantId: 't1', roles: ['SUPER_ADMIN'] } }),
      }),
    } as any;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockTenantService.findOne).not.toHaveBeenCalled();
  });
});
