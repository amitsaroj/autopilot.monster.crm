import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Billing integrity:
 *  - usage_records: merge duplicate (tenant, metric, period_start) rows, then enforce uniqueness
 *    so usage can be incremented atomically with INSERT ... ON CONFLICT.
 *  - subscriptions: cancel_at_period_end, dunning start, Stripe event ordering watermark.
 *  - stripe_events: idempotency ledger for webhook deliveries.
 */
export class BillingIntegrity1740000000026 implements MigrationInterface {
  name = 'BillingIntegrity1740000000026';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Block concurrent writers while duplicates are merged (migration runs in a transaction).
    await queryRunner.query(`LOCK TABLE usage_records IN SHARE ROW EXCLUSIVE MODE`);
    // Keep the oldest row of each duplicate group and give it the group's summed totals.
    await queryRunner.query(`
      WITH grouped AS (
        SELECT id,
               row_number() OVER (
                 PARTITION BY tenant_id, metric, period_start ORDER BY created_at, id
               ) AS rn,
               sum(quantity) OVER w AS total_quantity,
               sum(total_cost) OVER w AS total_cost_sum,
               count(*) OVER w AS group_size
        FROM usage_records
        WINDOW w AS (PARTITION BY tenant_id, metric, period_start)
      )
      UPDATE usage_records u
         SET quantity = g.total_quantity, total_cost = g.total_cost_sum, updated_at = now()
        FROM grouped g
       WHERE u.id = g.id AND g.rn = 1 AND g.group_size > 1
    `);
    await queryRunner.query(`
      DELETE FROM usage_records u
       USING (
         SELECT id, row_number() OVER (
           PARTITION BY tenant_id, metric, period_start ORDER BY created_at, id
         ) AS rn
         FROM usage_records
       ) d
       WHERE u.id = d.id AND d.rn > 1
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_usage_records_tenant_metric_period
        ON usage_records (tenant_id, metric, period_start)
    `);

    await queryRunner.query(`
      ALTER TABLE subscriptions
        ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS past_due_since timestamptz NULL,
        ADD COLUMN IF NOT EXISTS last_stripe_event_created bigint NULL
    `);
    await queryRunner.query(`
      UPDATE subscriptions SET past_due_since = updated_at
       WHERE status = 'PAST_DUE' AND past_due_since IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stripe_events (
        id varchar(255) PRIMARY KEY,
        type varchar(100) NOT NULL,
        created bigint NOT NULL,
        processed_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS stripe_events`);
    await queryRunner.query(`
      ALTER TABLE subscriptions
        DROP COLUMN IF EXISTS last_stripe_event_created,
        DROP COLUMN IF EXISTS past_due_since,
        DROP COLUMN IF EXISTS cancel_at_period_end
    `);
    // Merged duplicate usage rows are not restored.
    await queryRunner.query(`DROP INDEX IF EXISTS uq_usage_records_tenant_metric_period`);
  }
}
