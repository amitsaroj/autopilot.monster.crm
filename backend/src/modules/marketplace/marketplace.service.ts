import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plugin } from '../../database/entities/plugin.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';
import { ProductEntitlement } from '../../database/entities/product-entitlement.entity';
import {
  AUTOMATION_PLUGIN_CATEGORY,
  AUTOMATION_SLUG_PREFIX,
} from '../whatsapp-automation/whatsapp-automation.registry';

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
      where: { tenantId, isEnabled: true },
      relations: ['plugin'],
      order: { createdAt: 'DESC' },
    });
  }

  async install(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const plugin = await this.getApp(pluginId);

    if (plugin.status !== 'ACTIVE') throw new BadRequestException('App is not active');
    if (
      plugin.category === AUTOMATION_PLUGIN_CATEGORY ||
      plugin.slug.startsWith(AUTOMATION_SLUG_PREFIX)
    ) {
      throw new BadRequestException(
        'Install WhatsApp products through /whatsapp-automations/catalog/:slug/install with validated configuration',
      );
    }
    if (plugin.isPremium) {
      const entitled = await this.tenantPluginRepository.manager
        .getRepository(ProductEntitlement)
        .createQueryBuilder('entitlement')
        .where('entitlement.tenantId = :tenantId', { tenantId })
        .andWhere('entitlement.pluginId = :pluginId', { pluginId })
        .andWhere('entitlement.status = :status', { status: 'ACTIVE' })
        .andWhere('entitlement.lastEventId IS NOT NULL')
        .andWhere('(entitlement.expiresAt IS NULL OR entitlement.expiresAt > now())')
        .getExists();
      if (!entitled)
        throw new ForbiddenException(
          'Verified paid product entitlement is required before installation',
        );
    }

    const existing = await this.tenantPluginRepository.findOne({
      where: { tenantId, pluginId },
    });

    if (existing) {
      if (existing.isEnabled) {
        throw new BadRequestException('App already installed');
      }
      existing.isEnabled = true;
      existing.installedAt = new Date();
      return this.tenantPluginRepository.save(existing);
    }

    return this.tenantPluginRepository.save(
      this.tenantPluginRepository.create({
        tenantId,
        pluginId: plugin.id,
        isEnabled: true,
        config: {},
        installedAt: new Date(),
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

    if (installation.config.kind === AUTOMATION_PLUGIN_CATEGORY) {
      throw new BadRequestException(
        'Uninstall linked WhatsApp workflows through /whatsapp-automations/installed/:id',
      );
    }
    installation.isEnabled = false;
    await this.tenantPluginRepository.save(installation);
  }

  async onboardVendor(
    _tenantId: string,
    _details: { companyName: string; contactEmail: string; stripeAccountId?: string },
  ): Promise<never> {
    throw new ServiceUnavailableException(
      'Verified vendor onboarding and payouts are not implemented',
    );
  }

  async getVendorDetails(_tenantId: string): Promise<never> {
    throw new ServiceUnavailableException('Verified vendor account data is not available');
  }

  async recordPurchase(_tenantId: string, _appId: string, _amount: number): Promise<never> {
    throw new ForbiddenException(
      'Client-reported purchases cannot grant access or revenue; use verified product checkout',
    );
  }

  async getRevenueReport(_tenantId: string): Promise<never> {
    throw new ServiceUnavailableException('Settled vendor revenue reporting is not implemented');
  }
}
