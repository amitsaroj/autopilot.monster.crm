import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoiceCampaignCallLink1740000000004 implements MigrationInterface {
  name = 'VoiceCampaignCallLink1740000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voice_calls
      ADD COLUMN IF NOT EXISTS campaign_id uuid NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_voice_calls_campaign_id
      ON voice_calls (campaign_id)
      WHERE campaign_id IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_voice_calls_campaign_id`);
    await queryRunner.query(`
      ALTER TABLE voice_calls
      DROP COLUMN IF EXISTS campaign_id
    `);
  }
}
