import { Injectable } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { Company } from '../../database/entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async create(tenantId: string, data: Partial<Company>): Promise<Company> {
    return this.repository.create(tenantId, data);
  }

  async findAll(tenantId: string): Promise<Company[]> {
    return this.repository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Company | null> {
    return this.repository.findById(tenantId, id);
  }

  async update(tenantId: string, id: string, data: Partial<Company>): Promise<Company> {
    return this.repository.updateWithTenant(tenantId, id, data);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.repository.delete(tenantId, id);
  }
}
