import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Injectable()
export class SubAdminMarketplaceService {
  constructor(
    @InjectRepository(Plugin) private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin) private readonly tenantPluginRepo: Repository<TenantPlugin>,
  ) {}

  async discover() {
    return this.pluginRepo.find({ where: { status: 'ACTIVE' } });
  }

  async install(tenantId: string, pluginId: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Marketplace item not found');
    
    const existing = await this.tenantPluginRepo.findOne({ where: { tenantId, pluginId } });
    if (existing) return existing;

    const tenantPlugin = this.tenantPluginRepo.create({
      tenantId,
      pluginId,
      status: 'ENABLED'
    });
    return this.tenantPluginRepo.save(tenantPlugin);
  }
}
