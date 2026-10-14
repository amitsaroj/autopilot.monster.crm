import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  AUTOMATION_PLUGIN_CATEGORY,
  WHATSAPP_AUTOMATION_PACKS,
} from '../../modules/whatsapp-automation/whatsapp-automation.registry';

export class WhatsAppAutomationPacks1740000000020 implements MigrationInterface {
  name = 'WhatsAppAutomationPacks1740000000020';

  async up(queryRunner: QueryRunner): Promise<void> {
    const slugs = [
      'follow-up-sequence',
      'new-contact-nurture',
      'reply-timeout-handoff',
      'property-inquiry',
      'education-inquiry',
    ];
    for (const slug of slugs) {
      const product = WHATSAPP_AUTOMATION_PACKS.find(
        (entry) => entry.slug === `wa-automation-${slug}`,
      );
      if (!product || product.version !== '1.0.0')
        throw new Error(`Missing automation pack snapshot: ${slug}`);
      await queryRunner.query(
        `INSERT INTO plugins(tenant_id,name,slug,description,version,author,category,
        "configSchema","isPremium",status,price_monthly)
        SELECT id,$1,$2,$3,$4,'Autopilot Monster',$5,$6::jsonb,false,'ACTIVE',NULL FROM tenants WHERE slug='default'
        ON CONFLICT (slug) DO NOTHING`,
        [
          product.name,
          product.slug,
          product.description,
          product.version,
          AUTOMATION_PLUGIN_CATEGORY,
          JSON.stringify({
            ...product.configSchema,
            kind: AUTOMATION_PLUGIN_CATEGORY,
            slug: product.slug,
            version: product.version,
          }),
        ],
      );
      const rows: unknown = await queryRunner.query(
        'SELECT id FROM plugins WHERE slug=$1 AND category=$2',
        [product.slug, AUTOMATION_PLUGIN_CATEGORY],
      );
      if (!Array.isArray(rows) || rows.length !== 1)
        throw new Error(`Automation listing was not provisioned: ${product.slug}`);
    }
  }

  async down(): Promise<void> {
    // Retain listings, installations and commercial history on rollback.
  }
}
