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
      where: { tenantId, isEnabled: true },
      relations: ['plugin'],
      order: { createdAt: 'DESC' },
    });
  }

  async install(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const plugin = await this.getApp(pluginId);

    if (plugin.isPremium && !plugin.stripePriceId) {
      throw new BadRequestException(
        'Premium app requires billing setup. Contact support to enable this plugin.',
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

    installation.isEnabled = false;
    await this.tenantPluginRepository.save(installation);
  }

  private vendors: Map<string, {
    tenantId: string;
    companyName: string;
    contactEmail: string;
    stripeAccountId?: string;
    revenueShareRate: number;
    balance: number;
    payouts: any[];
  }> = new Map();

  async onboardVendor(tenantId: string, details: { companyName: string; contactEmail: string; stripeAccountId?: string }) {
    this.logger.log(`Onboarding vendor for tenant ${tenantId}`);
    const vendor = {
      tenantId,
      companyName: details.companyName,
      contactEmail: details.contactEmail,
      stripeAccountId: details.stripeAccountId || `acct_sim_${Date.now()}`,
      revenueShareRate: 0.70,
      balance: 0.00,
      payouts: []
    };
    this.vendors.set(tenantId, vendor);
    return vendor;
  }

  async getVendorDetails(tenantId: string) {
    let vendor = this.vendors.get(tenantId);
    if (!vendor) {
      return {
        tenantId,
        onboarded: false,
        balance: 0.00,
        revenueShareRate: 0.70,
        payouts: []
      };
    }
    return {
      ...vendor,
      onboarded: true
    };
  }

  async recordPurchase(_tenantId: string, appId: string, amount: number) {
    const plugin = await this.getAppById(appId);
    const vendorTenantId = plugin.author || 'system-platform'; 
    const vendor = this.vendors.get(vendorTenantId);

    const platformShare = amount * 0.30;
    const vendorShare = amount * 0.70;

    if (vendor) {
      vendor.balance += vendorShare;
      this.logger.log(`Credited vendor ${vendorTenantId} with $${vendorShare.toFixed(2)} (Platform share: $${platformShare.toFixed(2)})`);
    } else {
      this.logger.log(`Purchase of $${amount} recorded. No custom vendor found.`);
    }

    return {
      success: true,
      appId,
      amount,
      vendorShare: vendor ? vendorShare : 0,
      platformShare
    };
  }

  async getRevenueReport(tenantId: string) {
    const vendor = this.vendors.get(tenantId);
    if (!vendor) {
      return {
        totalEarnings: 0,
        currentBalance: 0,
        payouts: []
      };
    }
    return {
      totalEarnings: vendor.balance,
      currentBalance: vendor.balance,
      payouts: vendor.payouts
    };
  }
}
