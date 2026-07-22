import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { EVENT_NAMES } from '../../events/event.constants';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly logRepo: Repository<AuditLog>,
  ) {}

  async log(data: Partial<AuditLog>) {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  @OnEvent(EVENT_NAMES.AUDIT_LOG, { async: true })
  async handleAuditLogEvent(payload: Partial<AuditLog>) {
    try {
      await this.log(payload);
    } catch (error) {
      this.logger.error(
        'Failed to write audit log event',
        error instanceof Error ? error.stack : undefined,
      );
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
