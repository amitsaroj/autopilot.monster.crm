import { MigrationInterface, QueryRunner } from 'typeorm';
export class WhatsAppConsent1740000000015 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS whatsapp_consents (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz, created_by uuid, updated_by uuid,
      phone varchar(15) NOT NULL, status varchar(20) NOT NULL,
      scope varchar(20) NOT NULL DEFAULT 'ALL', source varchar(200) NOT NULL,
      evidence text, contact_id uuid)`);
    await q.query(
      `CREATE INDEX IF NOT EXISTS whatsapp_consent_lookup ON whatsapp_consents(tenant_id, phone, created_at)`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS whatsapp_consents');
  }
}
