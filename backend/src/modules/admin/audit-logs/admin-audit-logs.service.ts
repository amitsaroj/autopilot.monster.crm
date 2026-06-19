import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AuditLog } from '@autopilot/core/database/entities/audit-log.entity';

interface AuditLogQueryOptions {
  tenantId?: string;
  userId?: string;
  action?: string;
  search?: string;
  category?: string;
  outcome?: string;
}

@Injectable()
export class AdminAuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(options: AuditLogQueryOptions) {
    const qb = this.auditRepo.createQueryBuilder('log').orderBy('log.createdAt', 'DESC').take(200);

    if (options.tenantId) {
      qb.andWhere('log.tenantId = :tenantId', { tenantId: options.tenantId });
    }
    if (options.userId) {
      qb.andWhere('log.userId = :userId', { userId: options.userId });
    }
    if (options.action) {
      qb.andWhere('log.action ILIKE :action', { action: `%${options.action}%` });
    }
    if (options.category && options.category !== 'All') {
      qb.andWhere('log.action ILIKE :category', { category: `${options.category.toLowerCase()}%` });
    }
    if (options.search) {
      const term = `%${options.search}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('log.action ILIKE :term', { term })
            .orWhere('log.resource ILIKE :term', { term })
            .orWhere('log.resourceId ILIKE :term', { term })
            .orWhere('log.ipAddress ILIKE :term', { term });
        }),
      );
    }

    const logs = await qb.getMany();

    return logs
      .map((log) => this.toAdminView(log, options.outcome))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }

  private toAdminView(log: AuditLog, outcomeFilter?: string) {
    const changes = log.changes ?? {};
    const outcome =
      typeof changes.outcome === 'string'
        ? changes.outcome
        : changes.success === false
          ? 'FAILURE'
          : 'SUCCESS';

    if (outcomeFilter && outcomeFilter !== 'All' && outcome !== outcomeFilter) {
      return null;
    }

    return {
      id: log.id,
      action: log.action,
      actor: changes.actorEmail ?? changes.actor ?? log.userId ?? 'system',
      actorRole: changes.actorRole ?? 'UNKNOWN',
      resource: log.resource,
      resourceId: log.resourceId,
      outcome,
      ip: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
      tenantId: log.tenantId,
      details: changes.details ?? changes.message,
    };
  }
}
