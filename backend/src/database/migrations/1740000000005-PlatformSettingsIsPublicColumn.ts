import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformSettingsIsPublicColumn1740000000005 implements MigrationInterface {
  name = 'PlatformSettingsIsPublicColumn1740000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE platform_settings
      ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE platform_settings
      DROP COLUMN IF EXISTS is_public
    `);
  }
}
