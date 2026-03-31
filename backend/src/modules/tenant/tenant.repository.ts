import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../database/entities/tenant.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly repository: Repository<Tenant>,
  ) {}

  async findAll(filter: any): Promise<[Tenant[], number]> {
    const { page = 1, limit = 10, status, search } = filter;
    const query = this.repository.createQueryBuilder('tenant');

    if (status) {
      query.andWhere('tenant.status = :status', { status });
    }

    if (search) {
      query.andWhere('(tenant.name ILIKE :search OR tenant.slug ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('tenant.created_at', 'DESC');

    return query.getManyAndCount();
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    return this.repository.findOne({ where: { customDomain: domain } });
  }

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.repository.create(data);
    return this.repository.save(tenant);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    await this.repository.update(id, data);
    return this.findById(id) as Promise<Tenant>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
