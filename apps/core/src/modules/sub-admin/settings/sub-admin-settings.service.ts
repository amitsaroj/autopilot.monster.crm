import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../database/entities/tenant.entity';

@Injectable()
export class SubAdminSettingsService {
  constructor(
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async getSettings(tenantId: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found in core manifold');
    return tenant;
  }

  async updateSettings(tenantId: string, dto: any) {
    await this.tenantRepo.update(tenantId, dto);
    return this.getSettings(tenantId);
  }
}
