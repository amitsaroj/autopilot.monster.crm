import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppTemplateHistory1740000000037 implements MigrationInterface {
  name = 'WhatsAppTemplateHistory1740000000037';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE whatsapp_template_history (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid NOT NULL,
      template_id uuid NOT NULL,
      source varchar(32) NOT NULL,
      actor_id uuid,
      snapshot jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE INDEX idx_whatsapp_template_history_tenant_template_created
      ON whatsapp_template_history (tenant_id, template_id, created_at DESC)`);
    await queryRunner.query(`CREATE FUNCTION reject_whatsapp_template_history_mutation() RETURNS trigger
      LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'WhatsApp template history is append-only'; END $$`);
    await queryRunner.query(`CREATE TRIGGER trg_whatsapp_template_history_append_only
      BEFORE UPDATE OR DELETE ON whatsapp_template_history
      FOR EACH ROW EXECUTE FUNCTION reject_whatsapp_template_history_mutation()`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trg_whatsapp_template_history_append_only ON whatsapp_template_history',
    );
    await queryRunner.query('DROP FUNCTION IF EXISTS reject_whatsapp_template_history_mutation()');
    await queryRunner.query(
      'DROP INDEX IF EXISTS idx_whatsapp_template_history_tenant_template_created',
    );
    await queryRunner.query('DROP TABLE IF EXISTS whatsapp_template_history');
  }
}
