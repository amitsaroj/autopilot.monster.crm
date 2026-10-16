import { MigrationInterface, QueryRunner } from 'typeorm';

/** Leads: optional phone (web/API leads often arrive email-only) and an acquisition source. */
export class CrmIntegrity1740000000027 implements MigrationInterface {
  name = 'CrmIntegrity1740000000027';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE leads
        ADD COLUMN IF NOT EXISTS source varchar(100) NULL,
        ALTER COLUMN phone DROP NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE leads SET phone = '' WHERE phone IS NULL`);
    await queryRunner.query(`
      ALTER TABLE leads
        ALTER COLUMN phone SET NOT NULL,
        DROP COLUMN IF EXISTS source
    `);
  }
}
