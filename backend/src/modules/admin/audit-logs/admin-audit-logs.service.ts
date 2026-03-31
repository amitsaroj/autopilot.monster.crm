import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@autopilot/core/database/entities/audit-log.entity';

@Injectable()
export class AdminAuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(options: { tenantId?: string; userId?: string; action?: string }) {
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;

    return this.auditRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
