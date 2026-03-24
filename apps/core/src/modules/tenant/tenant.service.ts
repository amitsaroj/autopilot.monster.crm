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

  async verifyDomain(id: string, domain: string): Promise<{ verified: boolean }> {
    // Stub logic: In real app, check DNS or TXT records
    console.log(`Verifying domain ${domain} for tenant ${id}`);
    const isVerified = true;
    if (isVerified) {
        await this.tenantRepository.update(id, { customDomain: domain });
    }
    return { verified: isVerified };
  }

  async updateBranding(id: string, data: any): Promise<Tenant> {
      return this.tenantRepository.update(id, { branding: data });
  }

  async getLimits(id: string) {
      // Stub: in real app, fetch from pricing/billing module
      console.log(`Fetching limits for tenant ${id}`);
      return { contacts: 1000, emails: 5000, storage: '1GB' };
  }

  async getUsage(id: string) {
      // Stub: in real app, fetch from usage records
      console.log(`Fetching usage for tenant ${id}`);
      return { contacts: 150, emails: 1200, storage: '150MB' };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.tenantRepository.softDelete(id);
  }
}
