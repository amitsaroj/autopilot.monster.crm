import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plugin } from '../../database/entities/plugin.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepository: Repository<Plugin>,
    @InjectRepository(TenantPlugin)
    private readonly tenantPluginRepository: Repository<TenantPlugin>,
  ) {}

  async listApps(): Promise<Plugin[]> {
    return this.pluginRepository.find({
      where: { status: 'ACTIVE' },
      order: { name: 'ASC' },
    });
  }

  async getApp(id: string): Promise<Plugin> {
    const plugin = await this.pluginRepository.findOne({ where: { id } });
    if (!plugin) {
      throw new NotFoundException('App not found');
    }
    return plugin;
  }

  async listInstalled(tenantId: string): Promise<TenantPlugin[]> {
    return this.tenantPluginRepository.find({
      where: { tenantId, status: 'ENABLED' },
      relations: ['plugin'],
      order: { createdAt: 'DESC' },
    });
  }

  async install(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const plugin = await this.getApp(pluginId);

    const existing = await this.tenantPluginRepository.findOne({
      where: { tenantId, pluginId },
    });

    if (existing) {
      if (existing.status === 'ENABLED') {
        throw new BadRequestException('App already installed');
      }
      existing.status = 'ENABLED';
      existing.lastSyncAt = new Date();
      return this.tenantPluginRepository.save(existing);
    }

    return this.tenantPluginRepository.save(
      this.tenantPluginRepository.create({
        tenantId,
        pluginId: plugin.id,
        status: 'ENABLED',
        config: {},
        lastSyncAt: new Date(),
      }),
    );
  }

  async uninstall(tenantId: string, pluginId: string): Promise<void> {
    const installation = await this.tenantPluginRepository.findOne({
      where: { tenantId, pluginId },
    });

    if (!installation) {
      throw new NotFoundException('App not installed');
    }

    installation.status = 'DISABLED';
    await this.tenantPluginRepository.save(installation);
  }
}
