import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1739900000000 implements MigrationInterface {
  name = 'InitialSchema1739900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        user_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        key_prefix varchar(20) NOT NULL,
        key_hash varchar NOT NULL,
        permissions text[] NOT NULL DEFAULT '{}',
        last_used_at timestamptz,
        expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        created_by uuid,
        updated_by uuid
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        stripe_payment_method_id varchar NOT NULL,
        type varchar(50) NOT NULL DEFAULT 'card',
        last_four varchar(4),
        brand varchar(50),
        exp_month integer,
        exp_year integer,
        is_default boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        created_by uuid,
        updated_by uuid,
        UNIQUE (tenant_id, stripe_payment_method_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS voice_campaigns (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        status varchar NOT NULL DEFAULT 'DRAFT',
        from_number varchar(20) NOT NULL,
        script text NOT NULL,
        contact_list_id uuid,
        scheduled_at timestamptz,
        started_at timestamptz,
        completed_at timestamptz,
        total_contacts integer NOT NULL DEFAULT 0,
        calls_made integer NOT NULL DEFAULT 0,
        calls_answered integer NOT NULL DEFAULT 0,
        calls_failed integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        created_by uuid,
        updated_by uuid
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_templates (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        category varchar NOT NULL DEFAULT 'UTILITY',
        language varchar(10) NOT NULL DEFAULT 'en_US',
        components jsonb NOT NULL DEFAULT '{}',
        status varchar NOT NULL DEFAULT 'PENDING',
        wa_template_id varchar,
        rejection_reason text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        created_by uuid,
        updated_by uuid
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_prompts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        content text NOT NULL,
        category varchar(100),
        tags text[] NOT NULL DEFAULT '{}',
        is_favorite boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        created_by uuid,
        updated_by uuid
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voice_campaigns_tenant_status ON voice_campaigns(tenant_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_tenant_name ON whatsapp_templates(tenant_id, name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_prompts_tenant_name ON ai_prompts(tenant_id, name)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_prompts`);
    await queryRunner.query(`DROP TABLE IF EXISTS whatsapp_templates`);
    await queryRunner.query(`DROP TABLE IF EXISTS voice_campaigns`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_methods`);
    await queryRunner.query(`DROP TABLE IF EXISTS api_keys`);
  }
}
