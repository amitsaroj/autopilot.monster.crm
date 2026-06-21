import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Injectable()
export class AdminPluginsService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin)
    private readonly tenantPluginRepo: Repository<TenantPlugin>,
  ) {}

  async findAll() {
    const plugins = await this.pluginRepo.find({ order: { name: 'ASC' } });
    const counts = await this.tenantPluginRepo
      .createQueryBuilder('tp')
      .select('tp.pluginId', 'pluginId')
      .addSelect('COUNT(*)', 'count')
      .where('tp.isEnabled = :enabled', { enabled: true })
      .groupBy('tp.pluginId')
      .getRawMany<{ pluginId: string; count: string }>();

    const countMap = new Map(counts.map((row) => [row.pluginId, Number(row.count)]));

    return plugins.map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      status: plugin.status,
      installCount: countMap.get(plugin.id) ?? 0,
    }));
  }
}
