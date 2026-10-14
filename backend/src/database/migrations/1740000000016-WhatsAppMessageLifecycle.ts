import { MigrationInterface, QueryRunner } from 'typeorm';
export class WhatsAppMessageLifecycle1740000000016 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE whatsapp_templates ADD COLUMN IF NOT EXISTS business_account_id varchar`,
    );
    await queryRunner.query(`ALTER TABLE whatsapp_messages
      ADD COLUMN IF NOT EXISTS workflow_dispatched boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS retry_allowed boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS phone_number_id varchar,
      ADD COLUMN IF NOT EXISTS idempotency_key varchar(200),
      ADD COLUMN IF NOT EXISTS request_hash varchar(64),
      ADD COLUMN IF NOT EXISTS provider_timestamp timestamptz,
      ADD COLUMN IF NOT EXISTS error_reason text,
      ADD COLUMN IF NOT EXISTS broadcast_id uuid`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_message_idempotency ON whatsapp_messages(tenant_id, idempotency_key)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS whatsapp_message_account_time ON whatsapp_messages(tenant_id, phone_number_id, created_at)`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE whatsapp_templates DROP COLUMN IF EXISTS business_account_id`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS whatsapp_message_idempotency`);
    await queryRunner.query(`DROP INDEX IF EXISTS whatsapp_message_account_time`);
    await queryRunner.query(`ALTER TABLE whatsapp_messages DROP COLUMN IF EXISTS workflow_dispatched, DROP COLUMN IF EXISTS retry_allowed, DROP COLUMN IF EXISTS phone_number_id,
      DROP COLUMN IF EXISTS idempotency_key, DROP COLUMN IF EXISTS request_hash,
      DROP COLUMN IF EXISTS provider_timestamp, DROP COLUMN IF EXISTS error_reason,
      DROP COLUMN IF EXISTS broadcast_id`);
  }
}
