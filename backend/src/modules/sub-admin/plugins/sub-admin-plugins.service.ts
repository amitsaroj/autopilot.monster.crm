import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';
import { Flow } from '../../../database/entities/flow.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';

@Injectable()
export class SubAdminPluginsService {
  constructor(
    @InjectRepository(Plugin) private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin) private readonly tenantPluginRepo: Repository<TenantPlugin>,
  ) {}

  async findAll(tenantId: string) {
    return this.tenantPluginRepo.find({
      where: { tenantId, isEnabled: true },
      relations: ['plugin'],
    });
  }

  async enable(tenantId: string, pluginId: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Plugin template not found');
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

  async disable(tenantId: string, pluginId: string) {
    const installation = await this.tenantPluginRepo.findOne({ where: { tenantId, pluginId } });
    if (!installation) throw new NotFoundException('Active plugin not found');
    return this.tenantPluginRepo.manager.transaction(async (manager) => {
      installation.isEnabled = false;
      if (typeof installation.config.flowId === 'string')
        await manager.update(
          Flow,
          { tenantId, id: installation.config.flowId },
          { isPublished: false },
        );
      return manager.save(installation);
    });
  }
}
