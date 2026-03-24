import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto } from './dto/crm.dto';
import { Company } from '../../database/entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async create(tenantId: string, dto: CreateCompanyDto): Promise<Company> {
    return this.companyRepository.create(tenantId, dto);
  }

  async findAll(tenantId: string): Promise<Company[]> {
    return this.companyRepository.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<Company> {
    const company = await this.companyRepository.findById(tenantId, id);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(tenantId: string, id: string, dto: Partial<CreateCompanyDto>): Promise<Company> {
    return this.companyRepository.update(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.companyRepository.delete(tenantId, id);
  }
}
