import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from '../../src/modules/tenant/tenant.service';
import { TenantRepository } from '../../src/modules/tenant/tenant.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;

  const mockRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findByCustomDomain: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: TenantRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe('create', () => {
    it('should create a tenant if slug is unique', async () => {
      mockRepo.findBySlug.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: '1', name: 'Test' });

      const result = await service.create({ name: 'Test', slug: 'test' });
      expect(result.id).toBe('1');
    });

    it('should throw ConflictException if slug exists', async () => {
      mockRepo.findBySlug.mockResolvedValue({ id: '1' });
      await expect(service.create({ name: 'T', slug: 't' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated result', async () => {
      mockRepo.findAll.mockResolvedValue([[{ id: '1' }], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return tenant if found', async () => {
      mockRepo.findById.mockResolvedValue({ id: '1' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tenant', async () => {
      mockRepo.findById.mockResolvedValue({ id: '1' });
      mockRepo.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('suspend', () => {
    it('should suspend tenant', async () => {
      mockRepo.findById.mockResolvedValue({ id: '1' });
      mockRepo.update.mockResolvedValue({ id: '1', status: 'SUSPENDED' });
      const result = await service.suspend('1');
      expect(result.status).toBe('SUSPENDED');
    });
  });
});
