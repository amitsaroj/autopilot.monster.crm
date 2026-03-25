import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Injectable()
export class AdminMarketplaceService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin)
    private readonly tenantPluginRepo: Repository<TenantPlugin>,
  ) {}

  async findAll() {
    return this.pluginRepo.find();
  }

  async create(dto: any) {
    const plugin = this.pluginRepo.create(dto);
    return this.pluginRepo.save(plugin);
  }

  async update(id: string, dto: any) {
    const plugin = await this.pluginRepo.findOne({ where: { id } });
    if (!plugin) throw new NotFoundException('Plugin not found');
    Object.assign(plugin, dto);
    return this.pluginRepo.save(plugin);
  }

  async delete(id: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id } });
    if (!plugin) throw new NotFoundException('Plugin not found');
    return this.pluginRepo.remove(plugin);
  }

  async getInstallations(pluginId: string) {
    return this.tenantPluginRepo.find({ 
      where: { pluginId },
      relations: ['tenant']
    });
  }
}
