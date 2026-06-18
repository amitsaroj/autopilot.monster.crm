import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../database/entities/audit-log.entity';

@Injectable()
export class SubAdminLogsService {
  constructor(
    @InjectRepository(AuditLog) private readonly logRepo: Repository<AuditLog>,
  ) {}

  async findAll(tenantId: string, query: any) {
    const { type, limit = 50 } = query;
    const where: any = { tenantId };
    if (type) where.type = type;

    return this.logRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
