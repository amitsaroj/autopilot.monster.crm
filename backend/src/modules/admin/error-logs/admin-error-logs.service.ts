import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ErrorLog } from '../../../database/entities/error-log.entity';

@Injectable()
export class AdminErrorLogsService {
  constructor(
    @InjectRepository(ErrorLog)
    private readonly errorRepo: Repository<ErrorLog>,
  ) {}

  async getLogs(query: { page: number; limit: number; search?: string }) {
    const skip = (query.page - 1) * query.limit;
    const where = query.search ? { message: Like(`%${query.search}%`) } : {};

    const [items, total] = await this.errorRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: query.limit,
      skip,
    });

    return { items, total };
  }
}
