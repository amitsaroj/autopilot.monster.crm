import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../database/entities/audit-log.entity';

@Injectable()
export class SubAdminLogsService {
  constructor(@InjectRepository(AuditLog) private readonly logRepo: Repository<AuditLog>) {}

  async findAll(tenantId: string, query: any) {
    const { type, action, resource, limit = 50 } = query;
    const where: any = { tenantId };
    // `type` is accepted as an alias for `action` (AuditLog has no `type` column).
    if (action || type) where.action = action || type;
    if (resource) where.resource = resource;

    return this.logRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
