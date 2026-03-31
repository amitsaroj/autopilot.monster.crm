import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tenant } from '@autopilot/core/database/entities/tenant.entity';

@Injectable()
export class AdminTenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async findAll(options: { search?: string }) {
    const where: any = {};
    if (options.search) {
      where.name = Like(`%${options.search}%`);
    }
    return this.tenantRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(data: any) {
    const tenant = this.tenantRepo.create(data);
    return this.tenantRepo.save(tenant);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.tenantRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);
    return this.tenantRepo.remove(tenant);
  }
}
