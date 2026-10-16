import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopifyConnections1740000000033 implements MigrationInterface {
  name = 'ShopifyConnections1740000000033';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE shopify_connections (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      created_by uuid,
      updated_by uuid,
      shop_domain varchar(255) NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'CONNECTED' CHECK (status IN ('CONNECTED','DEGRADED','DISCONNECTED')),
      encrypted_access_token text NOT NULL,
      encrypted_refresh_token text,
      scopes text[] NOT NULL DEFAULT '{}',
      access_token_expires_at timestamptz,
      refresh_token_expires_at timestamptz,
      webhook_status varchar(24) NOT NULL DEFAULT 'NOT_CONFIGURED' CHECK (webhook_status IN ('READY','DEGRADED','NOT_CONFIGURED')),
      webhook_subscription_ids text[] NOT NULL DEFAULT '{}',
      last_error varchar(500),
      connected_at timestamptz,
      disconnected_at timestamptz,
      CONSTRAINT uq_shopify_connections_shop_domain UNIQUE (shop_domain)
    )`);
    await queryRunner.query(`CREATE INDEX idx_shopify_connections_tenant_status
      ON shopify_connections(tenant_id, status)`);
    await queryRunner.query(`CREATE TABLE shopify_oauth_states (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      created_by uuid,
      updated_by uuid,
      shop_domain varchar(255) NOT NULL,
      state_hash varchar(64) NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL
    )`);
    await queryRunner.query(
      'CREATE INDEX idx_shopify_oauth_states_expiry ON shopify_oauth_states(expires_at)',
    );
    await queryRunner.query(`CREATE TABLE shopify_webhook_events (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz,
      created_by uuid,
      updated_by uuid,
      delivery_id varchar(255) NOT NULL,
      shop_domain varchar(255) NOT NULL,
      topic varchar(100) NOT NULL,
      event_name varchar(100) NOT NULL,
      payload jsonb NOT NULL,
      status varchar(16) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED','PROCESSING','PROCESSED','FAILED')),
      attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      received_at timestamptz NOT NULL DEFAULT now(),
      processed_at timestamptz,
      last_error varchar(300),
      CONSTRAINT uq_shopify_webhook_events_delivery UNIQUE (tenant_id, delivery_id)
    )`);
    await queryRunner.query(`CREATE INDEX idx_shopify_webhook_events_due
      ON shopify_webhook_events(status, received_at)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_shopify_webhook_events_due');
    await queryRunner.query('DROP TABLE IF EXISTS shopify_webhook_events');
    await queryRunner.query('DROP TABLE IF EXISTS shopify_oauth_states');
    await queryRunner.query('DROP INDEX IF EXISTS idx_shopify_connections_tenant_status');
    await queryRunner.query('DROP TABLE IF EXISTS shopify_connections');
  }
}
