import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ForecastService } from './forecast.service';
import { DealRepository } from './deal.repository';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { UserEntity } from '../auth/entities/user.entity';

describe('ForecastService', () => {
  let service: ForecastService;

  const mockDealRepository = {
    findAll: jest.fn(),
  };

  const mockStageRepository = {
    find: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastService,
        { provide: DealRepository, useValue: mockDealRepository },
        { provide: getRepositoryToken(PipelineStage), useValue: mockStageRepository },
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<ForecastService>(ForecastService);
    jest.clearAllMocks();
  });

  it('calculates weighted forecast from open deals', async () => {
    const deals: Partial<Deal>[] = [
      {
        id: 'deal-1',
        name: 'Enterprise',
        tenantId: 'tenant-1',
        pipelineId: 'pipe-1',
        stageId: 'stage-1',
        ownerId: 'user-1',
        status: DealStatus.OPEN,
        value: 10000,
        probability: 0,
        currency: 'USD',
        expectedCloseDate: new Date('2026-12-31'),
      },
    ];

    mockDealRepository.findAll.mockResolvedValue(deals);
    mockStageRepository.find.mockResolvedValue([
      { id: 'stage-1', name: 'Negotiation', probability: 70, tenantId: 'tenant-1' },
    ]);
    mockUserRepository.find.mockResolvedValue([
      { id: 'user-1', firstName: 'Alex', lastName: 'Smith', fullName: 'Alex Smith', tenantId: 'tenant-1' },
    ]);

    const result = await service.getForecast('tenant-1');

    expect(result.totalPipeline).toBe(10000);
    expect(result.totalForecast).toBe(7000);
    expect(result.dealCount).toBe(1);
    expect(result.deals[0].ownerName).toBe('Alex Smith');
    expect(result.deals[0].stageName).toBe('Negotiation');
  });
});
