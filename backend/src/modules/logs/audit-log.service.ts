import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { OnEvent } from '@nestjs/event-emitter';

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

  @OnEvent('audit.log', { async: true })
  async handleAuditLogEvent(payload: Partial<AuditLog>) {
    try {
      await this.log(payload);
    } catch (error) {
      console.error('Failed to write audit log event', error);
    }
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
