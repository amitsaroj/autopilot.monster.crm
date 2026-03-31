import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from '@autopilot/core/database/entities/webhook-log.entity';

@Injectable()
export class AdminWebhooksLogsService {
  constructor(
    @InjectRepository(WebhookLog)
    private readonly webhookLogRepo: Repository<WebhookLog>,
  ) {}

  async findAll(options: { tenantId?: string; webhookId?: string; status?: string }) {
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.webhookId) where.webhookId = options.webhookId;
    if (options.status) where.status = options.status;

    return this.webhookLogRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
