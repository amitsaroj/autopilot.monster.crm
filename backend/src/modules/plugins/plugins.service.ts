import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';

@Injectable()
export class PluginsService {
  constructor(
    @InjectRepository(TenantPlugin)
    private readonly tenantPluginRepository: Repository<TenantPlugin>,
  ) {}

  async listInstalled(tenantId: string): Promise<TenantPlugin[]> {
    return this.tenantPluginRepository.find({
      where: { tenantId, isEnabled: true },
      relations: ['plugin'],
      order: { createdAt: 'DESC' },
    });
  }

  async enable(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const existing = await this.tenantPluginRepository.findOne({
      where: { tenantId, pluginId },
      relations: ['plugin'],
    });

    if (existing) {
      existing.isEnabled = true;
      existing.installedAt = new Date();
      return this.tenantPluginRepository.save(existing);
    }

    return this.tenantPluginRepository.save(
      this.tenantPluginRepository.create({
        tenantId,
        pluginId,
        isEnabled: true,
        config: {},
        installedAt: new Date(),
      }),
    );
  }

  async disable(tenantId: string, pluginId: string): Promise<void> {
    const installation = await this.tenantPluginRepository.findOne({
      where: { tenantId, pluginId },
    });

    if (!installation) {
      throw new NotFoundException('Plugin not installed');
    }

    installation.isEnabled = false;
    await this.tenantPluginRepository.save(installation);
  }
}
