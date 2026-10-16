import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppEmbeddedSignup1740000000024 implements MigrationInterface {
  name = 'WhatsAppEmbeddedSignup1740000000024';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE whatsapp_accounts
        ADD COLUMN IF NOT EXISTS quality_rating varchar(20) NULL,
        ADD COLUMN IF NOT EXISTS messaging_limit_tier varchar(40) NULL,
        ADD COLUMN IF NOT EXISTS name_status varchar(40) NULL,
        ADD COLUMN IF NOT EXISTS webhook_subscribed boolean NULL,
        ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz NULL,
        ADD COLUMN IF NOT EXISTS last_health_error varchar(500) NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE whatsapp_accounts
        DROP COLUMN IF EXISTS last_health_error,
        DROP COLUMN IF EXISTS last_health_check_at,
        DROP COLUMN IF EXISTS webhook_subscribed,
        DROP COLUMN IF EXISTS name_status,
        DROP COLUMN IF EXISTS messaging_limit_tier,
        DROP COLUMN IF EXISTS quality_rating
    `);
  }
}
