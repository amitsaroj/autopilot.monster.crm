import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from '../../src/modules/tenant/tenant.controller';
import { TenantService } from '../../src/modules/tenant/tenant.service';

describe('TenantController', () => {
  let controller: TenantController;
  let service: TenantService;

  const mockTenantService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    suspend: jest.fn(),
    activate: jest.fn(),
    remove: jest.fn(),
    verifyDomain: jest.fn(),
    updateBranding: jest.fn(),
    getOverrides: jest.fn(),
    updateOverrides: jest.fn(),
    removeOverrides: jest.fn(),
  };

  const mockUser = {
    userId: 'u1',
    tenantId: 't1',
    email: 'test@test.com',
    roles: [],
    permissions: [],
    planId: 'p1',
    correlationId: 'c1',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    controller = module.get<TenantController>(TenantController);
    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should call service.findOne with user tenantId', async () => {
      mockTenantService.findOne.mockResolvedValue({ id: 't1' });
      await controller.getMe(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('t1');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with filter', async () => {
      const filter = { page: 1, limit: 10 };
      await controller.findAll(filter);
      expect(service.findAll).toHaveBeenCalledWith(filter);
    });
  });
});
