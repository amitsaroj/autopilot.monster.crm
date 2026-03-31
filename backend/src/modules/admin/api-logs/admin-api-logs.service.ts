import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLog } from '@autopilot/core/database/entities/api-log.entity';

@Injectable()
export class AdminApiLogsService {
  constructor(
    @InjectRepository(ApiLog)
    private readonly apiLogRepo: Repository<ApiLog>,
  ) {}

  async findAll(options: { tenantId?: string; method?: string; statusCode?: number }) {
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.method) where.method = options.method;
    if (options.statusCode) where.statusCode = options.statusCode;

    return this.apiLogRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
