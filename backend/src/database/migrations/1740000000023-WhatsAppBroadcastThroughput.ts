import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Recipient claims: outcome='sending' + claimed_at mark an in-flight send (no lock held during HTTP);
 * attempt versions the idempotency key so a definite rejection can be resent after a retry/resume.
 */
export class WhatsAppBroadcastThroughput1740000000023 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE whatsapp_broadcast_recipients
      ADD COLUMN IF NOT EXISTS attempt integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS claimed_at timestamptz`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE whatsapp_broadcast_recipients
      DROP COLUMN IF EXISTS attempt, DROP COLUMN IF EXISTS claimed_at`);
  }
}
