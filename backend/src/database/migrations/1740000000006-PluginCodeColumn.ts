import { MigrationInterface, QueryRunner } from 'typeorm';

export class PluginCodeColumn1740000000006 implements MigrationInterface {
  name = 'PluginCodeColumn1740000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plugins
      ADD COLUMN IF NOT EXISTS code text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plugins
      DROP COLUMN IF EXISTS code
    `);
  }
}
