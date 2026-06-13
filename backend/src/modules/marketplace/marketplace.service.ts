import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as vm from 'vm';
import { Plugin } from '../../database/entities/plugin.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';

export interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  author: string;
  isActive: boolean;
  pricing: 'free' | 'paid' | 'freemium';
  installed?: boolean;
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin)
    private readonly tenantPluginRepo: Repository<TenantPlugin>,
  ) {}

  async getApps(tenantId: string): Promise<MarketplaceApp[]> {
    const plugins = await this.pluginRepo.find({ where: { status: 'ACTIVE' } });
    const installed = await this.tenantPluginRepo.find({ where: { tenantId } as any });
    const installedIds = new Set(installed.map(tp => tp.pluginId));

    return plugins.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      category: p.category || 'general',
      icon: p.icon || '🔌',
      version: p.version || '1.0.0',
      author: p.author || 'Autopilot',
      isActive: p.status === 'ACTIVE',
      pricing: p.isPremium ? 'paid' : 'free',
      installed: installedIds.has(p.id),
    }));
  }

  async getAppById(appId: string): Promise<Plugin> {
    const plugin = await this.pluginRepo.findOne({ where: { id: appId } });
    if (!plugin) throw new NotFoundException(`App ${appId} not found`);
    return plugin;
  }

  async installApp(tenantId: string, appId: string): Promise<TenantPlugin> {
    const plugin = await this.getAppById(appId);

    const existing = await this.tenantPluginRepo.findOne({
      where: { tenantId, pluginId: appId } as any,
    });
    if (existing) {
      this.logger.warn(`App ${plugin.name} already installed for tenant ${tenantId}`);
      return existing;
    }

    const tenantPlugin = this.tenantPluginRepo.create({
      tenantId,
      pluginId: appId,
      status: 'ENABLED',
      config: {},
    });

    this.logger.log(`Installing app ${plugin.name} for tenant ${tenantId}`);
    return this.tenantPluginRepo.save(tenantPlugin);
  }

  async uninstallApp(tenantId: string, appId: string): Promise<void> {
    const result = await this.tenantPluginRepo.delete({ tenantId, pluginId: appId } as any);
    if (result.affected === 0) {
      throw new NotFoundException(`App ${appId} is not installed for this tenant`);
    }
    this.logger.log(`Uninstalled app ${appId} for tenant ${tenantId}`);
  }

  async getInstalledApps(tenantId: string): Promise<TenantPlugin[]> {
    return this.tenantPluginRepo.find({
      where: { tenantId } as any,
      relations: ['plugin'],
    });
  }

  async updateAppConfig(tenantId: string, appId: string, config: Record<string, any>): Promise<TenantPlugin> {
    const tp = await this.tenantPluginRepo.findOne({
      where: { tenantId, pluginId: appId } as any,
    });
    if (!tp) throw new NotFoundException(`App ${appId} not installed`);

    tp.config = { ...tp.config, ...config };
    return this.tenantPluginRepo.save(tp);
  }

  async toggleApp(tenantId: string, appId: string, enabled: boolean): Promise<TenantPlugin> {
    const tp = await this.tenantPluginRepo.findOne({
      where: { tenantId, pluginId: appId } as any,
    });
    if (!tp) throw new NotFoundException(`App ${appId} not installed`);

  tp.status = enabled ? 'ENABLED' : 'DISABLED';
    return this.tenantPluginRepo.save(tp);
  }

  async executePlugin(tenantId: string, appId: string, context: any = {}): Promise<any> {
    const tp = await this.tenantPluginRepo.findOne({
      where: { tenantId, pluginId: appId } as any,
      relations: ['plugin'],
    });

    if (!tp || tp.status !== 'ENABLED') {
      throw new Error(`Plugin ${appId} is not enabled for tenant ${tenantId}`);
    }

    const pluginCode = tp.plugin.code; // Assume the plugin entity has a 'code' field for JS
    if (!pluginCode) {
      this.logger.warn(`Plugin ${appId} has no executable code.`);
      return null;
    }

    this.logger.log(`Executing sandbox for plugin ${tp.plugin.name} (Tenant: ${tenantId})`);

    const sandbox = {
      tenantId,
      config: tp.config,
      context,
      console: {
        log: (...args: any[]) => this.logger.log(`[Plugin:${appId}]`, ...args),
        error: (...args: any[]) => this.logger.error(`[Plugin:${appId}]`, ...args),
      },
      result: null as any,
    };

    try {
      vm.createContext(sandbox);
      vm.runInContext(pluginCode, sandbox, { timeout: 1000 }); // 1 second timeout
      return sandbox.result;
    } catch (err: any) {
      this.logger.error(`Plugin ${appId} execution failed`, err);
      throw new Error(`Plugin execution error: ${err.message}`);
    }
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
