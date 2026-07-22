import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../database/base.repository';
import { Company } from '../../database/entities/company.entity';
import { CrmListQueryDto } from './dto/crm.dto';

@Injectable()
export class CompanyRepository extends BaseRepository<Company> {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {
    super(companyRepo);
  }

  async findFiltered(
    tenantId: string,
    query: CrmListQueryDto,
  ): Promise<[Company[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.companyRepo
      .createQueryBuilder('co')
      .where('co.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere(
        '(co.name ILIKE :search OR co.website ILIKE :search OR co.domain ILIKE :search OR co.industry ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('co.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  async hardDelete(tenantId: string, id: string): Promise<void> {
    await this.companyRepo.delete({ id, tenantId });
  }
}
