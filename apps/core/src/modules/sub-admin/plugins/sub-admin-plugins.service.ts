import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';

@Injectable()
export class SubAdminPluginsService {
  constructor(
    @InjectRepository(Plugin) private readonly pluginRepo: Repository<Plugin>,
  ) {}

  async findAll(tenantId: string) {
    return this.pluginRepo.find({ where: { tenantId } });
  }

  async enable(tenantId: string, pluginId: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Plugin template not found');
    
    plugin.tenantId = tenantId;
    return this.pluginRepo.save(plugin);
  }

  async disable(tenantId: string, pluginId: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id: pluginId, tenantId } });
    if (!plugin) throw new NotFoundException('Active plugin vector not found');
    return this.pluginRepo.delete(pluginId);
  }
}
