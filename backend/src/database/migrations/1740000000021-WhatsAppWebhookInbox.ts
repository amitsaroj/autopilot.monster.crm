import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppWebhookInbox1740000000021 implements MigrationInterface {
  name = 'WhatsAppWebhookInbox1740000000021';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS whatsapp_webhook_events (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid,
      phone_number_id varchar(64),
      business_account_id varchar(64),
      object varchar(64) NOT NULL,
      field varchar(64) NOT NULL,
      dedupe_key varchar(64) NOT NULL,
      payload jsonb NOT NULL,
      status varchar(16) NOT NULL DEFAULT 'RECEIVED'
        CHECK (status IN ('RECEIVED','PROCESSED','FAILED','IGNORED')),
      attempts integer NOT NULL DEFAULT 0,
      last_error text,
      received_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      processed_at timestamptz
    )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_whatsapp_webhook_events_dedupe_key" ON whatsapp_webhook_events(dedupe_key)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_whatsapp_webhook_events_status_received" ON whatsapp_webhook_events(status, received_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_whatsapp_webhook_events_tenant_status" ON whatsapp_webhook_events(tenant_id, status, received_at)`,
    );
    await queryRunner.query(`ALTER TABLE whatsapp_messages
      ADD COLUMN IF NOT EXISTS pricing_billable boolean,
      ADD COLUMN IF NOT EXISTS pricing_category varchar(64),
      ADD COLUMN IF NOT EXISTS pricing_model varchar(64)`);
    // Sweeper scans unconfirmed outbound rows by age.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS whatsapp_message_unconfirmed ON whatsapp_messages(updated_at) WHERE direction = 'OUTBOUND' AND status IN ('SENDING','UNKNOWN')`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS whatsapp_message_unconfirmed`);
    await queryRunner.query(`ALTER TABLE whatsapp_messages
      DROP COLUMN IF EXISTS pricing_billable,
      DROP COLUMN IF EXISTS pricing_category,
      DROP COLUMN IF EXISTS pricing_model`);
    await queryRunner.query(`DROP TABLE IF EXISTS whatsapp_webhook_events`);
  }
}
