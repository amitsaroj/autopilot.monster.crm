import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppBroadcastControls1740000000014 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TYPE whatsapp_broadcasts_status_enum ADD VALUE IF NOT EXISTS 'PAUSED'`);
    await q.query(`ALTER TYPE whatsapp_broadcasts_status_enum ADD VALUE IF NOT EXISTS 'CANCELLED'`);
    await q.query(`ALTER TABLE whatsapp_broadcasts
      ADD COLUMN phone_number_id varchar(64),
      ADD COLUMN template_components jsonb NOT NULL DEFAULT '[]',
      ADD COLUMN audience_prepared boolean NOT NULL DEFAULT false,
      ADD COLUMN control_version integer NOT NULL DEFAULT 0,
      ADD COLUMN next_send_at timestamptz`);
    await q.query(`CREATE TABLE whatsapp_broadcast_recipients (
      tenant_id uuid NOT NULL, broadcast_id uuid NOT NULL REFERENCES whatsapp_broadcasts(id) ON DELETE CASCADE,
      contact_id uuid NOT NULL, payload jsonb NOT NULL,
      outcome varchar(16), message_id uuid, error text,
      PRIMARY KEY (tenant_id, broadcast_id, contact_id))`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE whatsapp_broadcast_recipients`);
    await q.query(`ALTER TABLE whatsapp_broadcasts DROP COLUMN phone_number_id, DROP COLUMN template_components,
      DROP COLUMN audience_prepared, DROP COLUMN control_version, DROP COLUMN next_send_at`);
    // PostgreSQL enum values are deliberately retained to avoid unsafe enum recreation.
  }
}
