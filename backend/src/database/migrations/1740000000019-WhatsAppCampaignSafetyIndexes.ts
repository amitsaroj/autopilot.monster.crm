import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppCampaignSafetyIndexes1740000000019 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE whatsapp_broadcasts ADD COLUMN IF NOT EXISTS last_error text');
    await q.query(
      `CREATE INDEX IF NOT EXISTS "IDX_whatsapp_recipients_normalized_phone" ON whatsapp_broadcast_recipients (tenant_id,broadcast_id,(regexp_replace(payload->>'phone', '[^0-9]', '', 'g')))`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS "IDX_whatsapp_campaign_recipient_time" ON whatsapp_messages (tenant_id,"to",created_at) WHERE broadcast_id IS NOT NULL AND direction='OUTBOUND' AND deleted_at IS NULL`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE whatsapp_broadcasts DROP COLUMN IF EXISTS last_error');
    await q.query('DROP INDEX IF EXISTS "IDX_whatsapp_recipients_normalized_phone"');
    await q.query('DROP INDEX IF EXISTS "IDX_whatsapp_campaign_recipient_time"');
  }
}
