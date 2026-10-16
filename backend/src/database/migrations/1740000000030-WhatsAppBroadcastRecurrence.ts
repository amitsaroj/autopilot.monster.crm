import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppBroadcastRecurrence1740000000030 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE whatsapp_broadcasts
      ADD COLUMN recurrence_frequency varchar(10),
      ADD COLUMN recurrence_end_at timestamptz,
      ADD COLUMN recurrence_max_occurrences integer,
      ADD COLUMN recurrence_series_id uuid REFERENCES whatsapp_broadcasts(id) ON DELETE CASCADE,
      ADD COLUMN recurrence_occurrence integer NOT NULL DEFAULT 1,
      ADD COLUMN recurrence_state varchar(10),
      ADD CONSTRAINT chk_whatsapp_broadcast_recurrence_frequency
        CHECK (recurrence_frequency IS NULL OR recurrence_frequency IN ('DAILY','WEEKLY')),
      ADD CONSTRAINT chk_whatsapp_broadcast_recurrence_bound
        CHECK (recurrence_frequency IS NULL OR recurrence_end_at IS NOT NULL OR recurrence_max_occurrences IS NOT NULL),
      ADD CONSTRAINT chk_whatsapp_broadcast_recurrence_count
        CHECK (recurrence_max_occurrences IS NULL OR recurrence_max_occurrences BETWEEN 2 AND 366),
      ADD CONSTRAINT chk_whatsapp_broadcast_recurrence_occurrence
        CHECK (recurrence_occurrence >= 1),
      ADD CONSTRAINT chk_whatsapp_broadcast_recurrence_state
        CHECK (recurrence_state IS NULL OR recurrence_state IN ('ACTIVE','PAUSED','CANCELLED','FAILED','COMPLETED'))`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_whatsapp_broadcast_occurrence
      ON whatsapp_broadcasts (tenant_id, recurrence_series_id, recurrence_occurrence)
      WHERE recurrence_series_id IS NOT NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS uq_whatsapp_broadcast_occurrence');
    await queryRunner.query(`ALTER TABLE whatsapp_broadcasts
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_recurrence_state,
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_recurrence_occurrence,
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_recurrence_count,
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_recurrence_bound,
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_recurrence_frequency,
      DROP COLUMN IF EXISTS recurrence_state,
      DROP COLUMN IF EXISTS recurrence_occurrence,
      DROP COLUMN IF EXISTS recurrence_series_id,
      DROP COLUMN IF EXISTS recurrence_max_occurrences,
      DROP COLUMN IF EXISTS recurrence_end_at,
      DROP COLUMN IF EXISTS recurrence_frequency`);
  }
}
