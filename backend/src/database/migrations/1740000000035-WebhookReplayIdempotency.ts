import { MigrationInterface, QueryRunner } from 'typeorm';

export class WebhookReplayIdempotency1740000000035 implements MigrationInterface {
  name = 'WebhookReplayIdempotency1740000000035';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE webhook_deliveries ADD COLUMN replay_request_key varchar(200)',
    );
    await queryRunner.query(`CREATE UNIQUE INDEX uq_webhook_delivery_replay_request
      ON webhook_deliveries(tenant_id, webhook_id, replay_request_key)
      WHERE replay_request_key IS NOT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS uq_webhook_delivery_replay_request');
    await queryRunner.query(
      'ALTER TABLE webhook_deliveries DROP COLUMN IF EXISTS replay_request_key',
    );
  }
}
