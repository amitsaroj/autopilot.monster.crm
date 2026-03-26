import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../database/entities/audit-log.entity';
import { ApiLog } from '../../../database/entities/api-log.entity';
import { WebhookLog } from '../../../database/entities/webhook-log.entity';

@Injectable()
export class AdminLogsViewerService {
  constructor(
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(ApiLog) private readonly apiRepo: Repository<ApiLog>,
    @InjectRepository(WebhookLog) private readonly webhookRepo: Repository<WebhookLog>,
  ) {}

  async getUnifiedLogs(query: { page: number; limit: number; type?: string; search?: string }) {
    const skip = (query.page - 1) * query.limit;
    
    // In a real high-scale system, we'd use Elasticsearch or a dedicated log aggregator.
    // For this implementation, we pull from individual tables.
    
    let results: any[] = [];
    
    if (!query.type || query.type === 'AUDIT') {
       const [items] = await this.auditRepo.findAndCount({ order: { createdAt: 'DESC' }, take: query.limit, skip });
       results = results.concat(items.map(i => ({ ...i, logType: 'AUDIT' })));
    }
    
    if (!query.type || query.type === 'API') {
       const [items] = await this.apiRepo.findAndCount({ order: { createdAt: 'DESC' }, take: query.limit, skip });
       results = results.concat(items.map(i => ({ ...i, logType: 'API' })));
    }

    if (!query.type || query.type === 'WEBHOOK') {
       const [items] = await this.webhookRepo.findAndCount({ order: { createdAt: 'DESC' }, take: query.limit, skip });
       results = results.concat(items.map(i => ({ ...i, logType: 'WEBHOOK' })));
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, query.limit);
  }
}
