import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DealService } from './deal.service';
import { DealRepository } from './deal.repository';
import { PipelineService } from './pipeline.service';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';

describe('DealService', () => {
  let service: DealService;

  const mockDealRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateWithTenant: jest.fn(),
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

    service = module.get<DealService>(DealService);
    jest.clearAllMocks();
  });

  it('marks deal as won with full probability', async () => {
    const deal = {
      id: 'deal-1',
      tenantId: 'tenant-1',
      stageId: 'stage-1',
      status: DealStatus.OPEN,
      probability: 60,
      value: 1000,
    } as Deal;

    const wonDeal = { ...deal, status: DealStatus.WON, probability: 100 };

    mockDealRepository.findOne.mockResolvedValue(deal);
    mockDealRepository.updateWithTenant.mockResolvedValue(wonDeal);

    const result = await service.markWon('tenant-1', 'deal-1');

    expect(result.status).toBe(DealStatus.WON);
    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });
});
