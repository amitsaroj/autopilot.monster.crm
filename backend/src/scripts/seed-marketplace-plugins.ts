import { DataSource } from 'typeorm';
import { Plugin } from '../database/entities/plugin.entity';

const MARKETPLACE_PLUGINS = [
  {
    name: 'Slack Integration',
    slug: 'slack-integration',
    description: 'Send CRM notifications and deal updates to Slack channels.',
    version: '2.1.0',
    author: 'Autopilot Monster',
    category: 'Communication',
    isPremium: false,
  },
  {
    name: 'Stripe Connector',
    slug: 'stripe-connector',
    description: 'Sync invoices and payment events with Stripe.',
    version: '1.4.2',
    author: 'Autopilot Monster',
    category: 'Billing',
    isPremium: false,
  },
  {
    name: 'Zapier Bridge',
    slug: 'zapier-bridge',
    description: 'Connect workflows to 5,000+ apps via Zapier triggers and actions.',
    version: '3.0.1',
    author: 'Zapier Inc.',
    category: 'Automation',
    isPremium: true,
    priceMonthly: 15,
    vendorId: 'vendor-zapier',
    stripePriceId: 'price_zapier_plugin_monthly',
  },
  {
    name: 'HubSpot Sync',
    slug: 'hubspot-sync',
    description: 'Bi-directional contact and deal sync with HubSpot CRM.',
    version: '1.2.0',
    author: 'Partner Dev Co.',
    category: 'Integration',
    isPremium: true,
    priceMonthly: 29,
    vendorId: 'vendor-hubspot-sync',
    stripePriceId: 'price_hubspot_sync_monthly',
  },
  {
    name: 'AI Lead Scorer',
    slug: 'ai-lead-scorer',
    description: 'Score leads automatically using workspace AI models.',
    version: '1.0.4',
    author: 'Autopilot Monster',
    category: 'AI',
    isPremium: false,
  },
];

export async function seedMarketplacePlugins(
  dataSource: DataSource,
  platformTenantId: string,
): Promise<void> {
  const pluginRepo = dataSource.getRepository(Plugin);

  for (const item of MARKETPLACE_PLUGINS) {
    const existing = await pluginRepo.findOne({ where: { slug: item.slug } });
    if (existing) continue;

    await pluginRepo.save(
      pluginRepo.create({
        tenantId: platformTenantId,
        ...item,
        status: 'ACTIVE',
      }),
    );
  }

  console.log('Marketplace plugins seeded');
}
