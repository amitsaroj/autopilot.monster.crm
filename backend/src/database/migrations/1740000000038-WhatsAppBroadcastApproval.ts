import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppBroadcastApproval1740000000038 implements MigrationInterface {
  name = 'WhatsAppBroadcastApproval1740000000038';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE whatsapp_broadcasts
      ADD COLUMN IF NOT EXISTS approval_required boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS approval_status varchar(16) NOT NULL DEFAULT 'NOT_REQUIRED',
      ADD COLUMN IF NOT EXISTS approval_requested_by uuid,
      ADD COLUMN IF NOT EXISTS approval_reviewed_by uuid,
      ADD COLUMN IF NOT EXISTS approval_reviewed_at timestamptz,
      ADD COLUMN IF NOT EXISTS approval_note text`);
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint
        WHERE conname='chk_whatsapp_broadcast_approval_status'
          AND conrelid='whatsapp_broadcasts'::regclass) THEN
        ALTER TABLE whatsapp_broadcasts ADD CONSTRAINT chk_whatsapp_broadcast_approval_status
          CHECK (approval_status IN ('NOT_REQUIRED','PENDING','APPROVED','REJECTED'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint
        WHERE conname='chk_whatsapp_broadcast_approval_consistency'
          AND conrelid='whatsapp_broadcasts'::regclass) THEN
        ALTER TABLE whatsapp_broadcasts ADD CONSTRAINT chk_whatsapp_broadcast_approval_consistency
          CHECK ((approval_required AND approval_status <> 'NOT_REQUIRED')
            OR (NOT approval_required AND approval_status = 'NOT_REQUIRED'));
      END IF;
    END $$`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_whatsapp_broadcast_pending_approval
      ON whatsapp_broadcasts (tenant_id, created_at DESC)
      WHERE approval_status = 'PENDING' AND deleted_at IS NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_whatsapp_broadcast_pending_approval');
    await queryRunner.query(`ALTER TABLE whatsapp_broadcasts
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_approval_consistency,
      DROP CONSTRAINT IF EXISTS chk_whatsapp_broadcast_approval_status,
      DROP COLUMN IF EXISTS approval_note,
      DROP COLUMN IF EXISTS approval_reviewed_at,
      DROP COLUMN IF EXISTS approval_reviewed_by,
      DROP COLUMN IF EXISTS approval_requested_by,
      DROP COLUMN IF EXISTS approval_status,
      DROP COLUMN IF EXISTS approval_required`);
  }
}
