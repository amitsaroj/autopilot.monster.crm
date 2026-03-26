import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Injectable()
export class SubAdminPluginsService {
  constructor(
    @InjectRepository(Plugin) private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin) private readonly tenantPluginRepo: Repository<TenantPlugin>,
  ) {}

  async findAll(tenantId: string) {
    return this.tenantPluginRepo.find({
      where: { tenantId },
      relations: ['plugin'],
    });
  }

  async enable(tenantId: string, pluginId: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Plugin template not found');

    const existing = await this.tenantPluginRepo.findOne({ where: { tenantId, pluginId } });
    if (existing) {
      existing.status = 'ENABLED';
      return this.tenantPluginRepo.save(existing);
    }

    const tenantPlugin = this.tenantPluginRepo.create({
      tenantId,
      pluginId,
      status: 'ENABLED',
    });
    return this.tenantPluginRepo.save(tenantPlugin);
  }

  async disable(tenantId: string, pluginId: string) {
    const plugin = await this.tenantPluginRepo.findOne({ where: { tenantId, pluginId } });
    if (!plugin) throw new NotFoundException('Active plugin vector not found');
    return this.tenantPluginRepo.delete(plugin.id);
  }
}
