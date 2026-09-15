import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoiceCampaignBudgetAndObjective1740000000011 implements MigrationInterface {
  name = 'VoiceCampaignBudgetAndObjective1740000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voice_campaigns
      ADD COLUMN IF NOT EXISTS max_calls integer NULL,
      ADD COLUMN IF NOT EXISTS objective text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voice_campaigns
      DROP COLUMN IF EXISTS max_calls,
      DROP COLUMN IF EXISTS objective
    `);
  }
}
