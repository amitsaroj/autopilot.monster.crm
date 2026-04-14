import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly logRepo: Repository<AuditLog>,
  ) {}

  async log(data: Partial<AuditLog>) {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  async findByTenant(tenantId: string) {
    return this.logRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findAll() {
    return this.logRepo.find({
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
