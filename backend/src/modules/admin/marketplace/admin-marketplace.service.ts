import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from '../../../database/entities/plugin.entity';
import { TenantPlugin } from '../../../database/entities/tenant-plugin.entity';
import { Tenant } from '../../../database/entities/tenant.entity';
import { CreatePluginDto, UpdatePluginDto } from './admin-marketplace.dto';

const PLATFORM_REVENUE_SHARE = 0.2;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class AdminMarketplaceService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepo: Repository<Plugin>,
    @InjectRepository(TenantPlugin)
    private readonly tenantPluginRepo: Repository<TenantPlugin>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  private async getPlatformTenantId(): Promise<string> {
    const tenant = await this.tenantRepo.findOne({ where: { slug: 'default' } });
    if (!tenant) {
      throw new NotFoundException('Platform tenant not found');
    }
    return tenant.id;
  }

  private mapPlugin(plugin: Plugin, installCount = 0) {
    return {
      ...plugin,
      installCount,
      status: plugin.status,
    };
  }

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
    return plugins.map((plugin) => this.mapPlugin(plugin, countMap.get(plugin.id) ?? 0));
  }

  async create(dto: CreatePluginDto) {
    const tenantId = await this.getPlatformTenantId();
    const slug = dto.slug?.trim() || slugify(dto.name);

    const plugin = this.pluginRepo.create({
      tenantId,
      name: dto.name,
      slug,
      description: dto.description,
      version: dto.version,
      author: dto.author,
      category: dto.category,
      isPremium: dto.isPremium ?? false,
      priceMonthly: dto.priceMonthly,
      vendorId: dto.vendorId,
      stripePriceId: dto.stripePriceId,
      status: dto.isActive === false ? 'INACTIVE' : 'ACTIVE',
    });
    const saved = await this.pluginRepo.save(plugin);
    return this.mapPlugin(saved, 0);
  }

  async update(id: string, dto: UpdatePluginDto) {
    const plugin = await this.pluginRepo.findOne({ where: { id } });
    if (!plugin) throw new NotFoundException('Plugin not found');

    if (dto.name !== undefined) plugin.name = dto.name;
    if (dto.description !== undefined) plugin.description = dto.description;
    if (dto.version !== undefined) plugin.version = dto.version;
    if (dto.author !== undefined) plugin.author = dto.author;
    if (dto.category !== undefined) plugin.category = dto.category;
    if (dto.isPremium !== undefined) plugin.isPremium = dto.isPremium;
    if (dto.priceMonthly !== undefined) plugin.priceMonthly = dto.priceMonthly;
    if (dto.vendorId !== undefined) plugin.vendorId = dto.vendorId;
    if (dto.stripePriceId !== undefined) plugin.stripePriceId = dto.stripePriceId;
    if (dto.isActive !== undefined) plugin.status = dto.isActive ? 'ACTIVE' : 'INACTIVE';

    const saved = await this.pluginRepo.save(plugin);
    const installCount = await this.tenantPluginRepo.count({
      where: { pluginId: id, isEnabled: true },
    });
    return this.mapPlugin(saved, installCount);
  }

  async delete(id: string) {
    const plugin = await this.pluginRepo.findOne({ where: { id } });
    if (!plugin) throw new NotFoundException('Plugin not found');
    return this.pluginRepo.remove(plugin);
  }

  async getInstallations(pluginId: string) {
    return this.tenantPluginRepo.find({
      where: { pluginId, isEnabled: true },
      relations: ['tenant'],
    });
  }

  async getMonetizationStats() {
    const premiumPlugins = await this.pluginRepo.find({ where: { isPremium: true } });
    const installations = await this.tenantPluginRepo.find({
      where: { isEnabled: true },
      relations: ['plugin'],
    });

    const premiumInstalls = installations.filter((item) => item.plugin?.isPremium);
    const grossVolume = premiumInstalls.reduce(
      (sum, item) => sum + Number(item.plugin?.priceMonthly ?? 0),
      0,
    );
    const platformShare = grossVolume * PLATFORM_REVENUE_SHARE;
    const developerShare = grossVolume - platformShare;

    return {
      grossVolume,
      platformShare,
      developerShare,
      pendingPayouts: developerShare,
      premiumPluginCount: premiumPlugins.length,
      premiumInstallCount: premiumInstalls.length,
      revenueShareRate: PLATFORM_REVENUE_SHARE,
    };
  }
}
