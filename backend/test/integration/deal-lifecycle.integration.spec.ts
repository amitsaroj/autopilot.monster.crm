import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DealService } from '../../src/modules/crm/deal.service';
import { DealRepository } from '../../src/modules/crm/deal.repository';
import { PipelineService } from '../../src/modules/crm/pipeline.service';
import { Deal, DealStatus } from '../../src/database/entities/deal.entity';
import { PipelineStage } from '../../src/database/entities/pipeline-stage.entity';

describe('Deal lifecycle integration', () => {
  let service: DealService;

  const mockDealRepository = {
    findOne: jest.fn(),
    updateWithTenant: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockPipelineService = {
    findOne: jest.fn(),
    findDefault: jest.fn(),
  };

  const mockStageRepository = {
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealService,
        { provide: DealRepository, useValue: mockDealRepository },
        { provide: PipelineService, useValue: mockPipelineService },
        { provide: getRepositoryToken(PipelineStage), useValue: mockStageRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get(DealService);
    jest.clearAllMocks();
  });

  it('marks deal won and emits lifecycle event', async () => {
    const deal = {
      id: 'deal-1',
      tenantId: 'tenant-1',
      status: DealStatus.OPEN,
      probability: 50,
    } as Deal;

    mockDealRepository.findOne.mockResolvedValue(deal);
    mockDealRepository.updateWithTenant.mockResolvedValue({
      ...deal,
      status: DealStatus.WON,
      probability: 100,
    });

    const result = await service.markWon('tenant-1', 'deal-1');

    expect(result.status).toBe(DealStatus.WON);
    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });
});
