import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plugin } from '../../database/entities/plugin.entity';
import { Flow } from '../../database/entities/flow.entity';
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
    const plugin = await this.tenantPluginRepository.manager
      .getRepository(Plugin)
      .findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Plugin not found');
    if (plugin.status !== 'ACTIVE' || plugin.isPremium || Number(plugin.priceMonthly) > 0)
      throw new ForbiddenException(
        'Verified purchase or subscription entitlement is required through the marketplace',
      );
    if (
      plugin.slug.startsWith('whatsapp-') ||
      plugin.slug.startsWith('wa-automation-') ||
      plugin.category === 'WHATSAPP_AUTOMATION'
    )
      throw new ForbiddenException('Install WhatsApp automations through the automation catalog');
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

    await this.tenantPluginRepository.manager.transaction(async (manager) => {
      installation.isEnabled = false;
      if (typeof installation.config.flowId === 'string')
        await manager.update(
          Flow,
          { tenantId, id: installation.config.flowId },
          { isPublished: false },
        );
      await manager.save(installation);
    });
  }
}
