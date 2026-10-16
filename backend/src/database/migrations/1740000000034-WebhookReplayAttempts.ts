import { MigrationInterface, QueryRunner } from 'typeorm';

export class WebhookReplayAttempts1740000000034 implements MigrationInterface {
  name = 'WebhookReplayAttempts1740000000034';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE webhook_deliveries ADD COLUMN replay_of uuid REFERENCES webhook_deliveries(id) ON DELETE SET NULL',
    );
    await queryRunner.query(
      'CREATE INDEX idx_webhook_deliveries_replay_of ON webhook_deliveries(replay_of) WHERE replay_of IS NOT NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_webhook_deliveries_replay_of');
    await queryRunner.query('ALTER TABLE webhook_deliveries DROP COLUMN IF EXISTS replay_of');
  }
}
