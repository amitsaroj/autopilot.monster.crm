import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { TenantRepository } from './tenant.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from '../../database/entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findBySlug(createTenantDto.slug);
    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }
    return this.tenantRepository.create(createTenantDto);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: Partial<CreateTenantDto>): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantRepository.update(id, updateTenantDto);
  }

  async suspend(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantRepository.update(id, { status: 'SUSPENDED' });
  }

  async activate(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantRepository.update(id, { status: 'ACTIVE' });
  }

  async verifyDomain(id: string, domain: string): Promise<{ verified: boolean }> {
    const existing = await this.tenantRepository.findByCustomDomain(domain);
    if (existing && existing.id !== id) {
      throw new ConflictException('Domain already in use by another tenant');
    }
    // Mocking DNS check
    const isVerified = true; 
    if (isVerified) {
      await this.tenantRepository.update(id, { customDomain: domain });
    }
    return { verified: isVerified };
  }

  async updateBranding(id: string, data: any): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantRepository.update(id, { branding: data });
  }

  async getOverrides(id: string) {
    const tenant = await this.findOne(id);
    return tenant.overrides || { features: {}, limits: {} };
  }

  async updateOverrides(id: string, overrides: any) {
    await this.findOne(id);
    return this.tenantRepository.update(id, { overrides });
  }

  async removeOverrides(id: string) {
    await this.findOne(id);
    return this.tenantRepository.update(id, { overrides: undefined });
  }

  async getLimits(id: string) {
    await this.findOne(id);
    // Future: fetch from BillingModule
    return { contacts: 1000, emails: 5000, storage: '1GB' };
  }

  async getUsage(id: string) {
    await this.findOne(id);
    // Future: fetch from UsageModule
    return { contacts: 150, emails: 1200, storage: '150MB' };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.tenantRepository.softDelete(id);
  }
}
