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

  async discover(tenantId: string) {
    const plugins = await this.pluginRepo.find({ where: { status: 'ACTIVE' } });
    const installations = await this.tenantPluginRepo.find({
      where: { tenantId, isEnabled: true },
    });
    const installedIds = new Set(installations.map((item) => item.pluginId));

    return plugins.map((plugin) => ({
      ...plugin,
      isInstalled: installedIds.has(plugin.id),
    }));
  }

  async install(tenantId: string, pluginId: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Marketplace item not found');

    const existing = await this.tenantPluginRepo.findOne({ where: { tenantId, pluginId } });
    if (existing) {
      existing.isEnabled = true;
      existing.installedAt = new Date();
      return this.tenantPluginRepo.save(existing);
    }

    const tenantPlugin = this.tenantPluginRepo.create({
      tenantId,
      pluginId,
      isEnabled: true,
      config: {},
      installedAt: new Date(),
    });
    return this.tenantPluginRepo.save(tenantPlugin);
  }
}
