import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingEventOutbox1740000000032 implements MigrationInterface {
  name = 'BillingEventOutbox1740000000032';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE billing_event_outbox (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid NOT NULL,
      event varchar(64) NOT NULL,
      event_id varchar(255) NOT NULL,
      payload jsonb NOT NULL,
      status varchar(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','DELIVERED')),
      attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
      next_attempt_at timestamptz NOT NULL DEFAULT now(),
      lease_expires_at timestamptz,
      last_error varchar(80),
      dispatched_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT uq_billing_event_outbox_delivery UNIQUE (tenant_id, event, event_id)
    )`);
    await queryRunner.query(`CREATE INDEX idx_billing_event_outbox_due
      ON billing_event_outbox(status, next_attempt_at, created_at)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_billing_event_outbox_due');
    await queryRunner.query('DROP TABLE IF EXISTS billing_event_outbox');
  }
}
