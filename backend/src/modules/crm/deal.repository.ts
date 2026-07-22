import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../database/base.repository';
import { Deal } from '../../database/entities/deal.entity';
import { CrmListQueryDto } from './dto/crm.dto';

@Injectable()
export class DealRepository extends BaseRepository<Deal> {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
  ) {
    super(dealRepo);
  }

  async findFiltered(
    tenantId: string,
    query: CrmListQueryDto,
  ): Promise<[Deal[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.dealRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.contact', 'contact')
      .leftJoinAndSelect('d.company', 'company')
      .leftJoinAndSelect('d.stage', 'stage')
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.deleted_at IS NULL');

    if (query.pipelineId) {
      qb.andWhere('d.pipeline_id = :pipelineId', { pipelineId: query.pipelineId });
    }
    if (query.status) {
      qb.andWhere('d.status = :status', { status: query.status });
    }
    if (query.companyId) {
      qb.andWhere('d.company_id = :companyId', { companyId: query.companyId });
    }
    if (query.search) {
      qb.andWhere('d.name ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('d.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }
}
