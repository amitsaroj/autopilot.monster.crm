import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/health/health.controller';
import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;

  beforeEach(async () => {
    const mockHealthCheck = jest.fn().mockResolvedValue({ status: 'ok', details: {} });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: mockHealthCheck },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: { pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }) },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: { checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }) },
        },
        {
          provide: DiskHealthIndicator,
          useValue: { checkStorage: jest.fn().mockResolvedValue({ disk: { status: 'up' } }) },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /health — should call health check service', async () => {
    (healthCheckService.check as jest.Mock).mockResolvedValue({ status: 'ok', details: {} });
    const result = await controller.check();
    expect(healthCheckService.check).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok', details: {} });
  });

  it('GET /health/ready — should call readiness check', async () => {
    (healthCheckService.check as jest.Mock).mockResolvedValue({ status: 'ok', details: {} });
    const result = await controller.readiness();
    expect(result).toBeDefined();
  });
});
