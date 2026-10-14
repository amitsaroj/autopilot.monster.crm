import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  AUTOMATION_PLUGIN_CATEGORY,
  WHATSAPP_AUTOMATION_PRODUCTS,
} from '../../modules/whatsapp-automation/whatsapp-automation.registry';

export class WhatsAppAutomationCatalog1740000000018 implements MigrationInterface {
  name = 'WhatsAppAutomationCatalog1740000000018';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS product_entitlements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
      plugin_id uuid NOT NULL REFERENCES plugins(id), status varchar(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','ACTIVE','REVOKED','EXPIRED')),
      source varchar(30) NOT NULL DEFAULT 'STRIPE', stripe_price_id varchar(255) NOT NULL,
      product_version varchar(50) NOT NULL, checkout_session_id varchar(255), stripe_subscription_id varchar(255),
      payment_intent_id varchar(255), stripe_customer_id varchar(255), expires_at timestamptz,
      last_event_id varchar(255), last_event_created bigint NOT NULL DEFAULT 0, revocation_reason varchar(50),
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz, created_by uuid, updated_by uuid
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_product_entitlements_tenant_plugin" ON product_entitlements(tenant_id,plugin_id)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_product_entitlements_checkout" ON product_entitlements(checkout_session_id)',
    );
    // Scope uniqueness to the new product type, without rewriting existing plugin installations.
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tenant_plugins_whatsapp_automation"
      ON tenant_plugins("tenantId",plugin_id) WHERE config->>'kind' = 'WHATSAPP_AUTOMATION' AND deleted_at IS NULL`);
    for (const product of WHATSAPP_AUTOMATION_PRODUCTS) {
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
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Preserve installed catalog rows and flows on rollback; commercial history must not be silently erased.
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_tenant_plugins_whatsapp_automation"');
    await queryRunner.query('DROP TABLE IF EXISTS product_entitlements');
  }
}
