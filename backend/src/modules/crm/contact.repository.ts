import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';
import { BaseRepository, stripImmutableFields } from '../../database/base.repository';
import { CrmListQueryDto } from './dto/crm.dto';

@Injectable()
export class ContactRepository extends BaseRepository<Contact> {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {
    super(contactRepository);
  }

  async createMany(tenantId: string, data: Partial<Contact>[]): Promise<Contact[]> {
    return this.contactRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Contact);
      return repository.save(
        data.map((item) => repository.create({ ...stripImmutableFields(item), tenantId })),
      );
    });
  }

  async findFiltered(tenantId: string, query: CrmListQueryDto): Promise<[Contact[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.contactRepository
      .createQueryBuilder('c')
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        '(c.first_name ILIKE :search OR c.last_name ILIKE :search OR c.email ILIKE :search OR c.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }

    if (query.companyId) {
      qb.andWhere('c.company_id = :companyId', { companyId: query.companyId });
    }

    qb.orderBy('c.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }
}
