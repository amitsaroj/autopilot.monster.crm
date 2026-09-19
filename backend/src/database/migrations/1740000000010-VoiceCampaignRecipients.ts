import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoiceCampaignRecipients1740000000010 implements MigrationInterface {
  name = 'VoiceCampaignRecipients1740000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voice_campaigns
      ADD COLUMN IF NOT EXISTS concurrency integer NOT NULL DEFAULT 3,
      ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS retry_delay_minutes integer NOT NULL DEFAULT 30,
      ADD COLUMN IF NOT EXISTS calling_hours_start varchar(5) NULL,
      ADD COLUMN IF NOT EXISTS calling_hours_end varchar(5) NULL,
      ADD COLUMN IF NOT EXISTS timezone varchar(64) NOT NULL DEFAULT 'UTC',
      ADD COLUMN IF NOT EXISTS agent_id uuid NULL,
      ADD COLUMN IF NOT EXISTS stopped_at timestamptz NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum WHERE enumlabel = 'STOPPED'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'voice_campaigns_status_enum')
        ) THEN
          ALTER TYPE voice_campaigns_status_enum ADD VALUE 'STOPPED';
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE voice_calls
      ADD COLUMN IF NOT EXISTS recipient_id uuid NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_voice_calls_recipient_id
      ON voice_calls (recipient_id)
      WHERE recipient_id IS NOT NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voice_campaign_recipients_status_enum') THEN
          CREATE TYPE voice_campaign_recipients_status_enum AS ENUM (
            'PENDING', 'QUEUED', 'CALLING', 'COMPLETED', 'FAILED',
            'NO_ANSWER', 'BUSY', 'RETRY_PENDING', 'SKIPPED', 'CANCELLED'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS voice_campaign_recipients (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        campaign_id uuid NOT NULL,
        contact_id uuid NOT NULL,
        phone varchar(30) NOT NULL,
        status voice_campaign_recipients_status_enum NOT NULL DEFAULT 'PENDING',
        attempts integer NOT NULL DEFAULT 0,
        max_attempts integer NOT NULL DEFAULT 1,
        next_attempt_at timestamptz NULL,
        last_attempt_at timestamptz NULL,
        call_id uuid NULL,
        outcome varchar(30) NULL,
        failure_reason text NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL,
        created_by uuid NULL,
        updated_by uuid NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vcr_tenant_campaign
      ON voice_campaign_recipients (tenant_id, campaign_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vcr_tenant_campaign_status
      ON voice_campaign_recipients (tenant_id, campaign_id, status)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_vcr_tenant_campaign_contact
      ON voice_campaign_recipients (tenant_id, campaign_id, contact_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS voice_campaign_recipients`);
    await queryRunner.query(`DROP TYPE IF EXISTS voice_campaign_recipients_status_enum`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_voice_calls_recipient_id`);
    await queryRunner.query(`
      ALTER TABLE voice_calls
      DROP COLUMN IF EXISTS recipient_id
    `);
    await queryRunner.query(`
      ALTER TABLE voice_campaigns
      DROP COLUMN IF EXISTS concurrency,
      DROP COLUMN IF EXISTS max_attempts,
      DROP COLUMN IF EXISTS retry_delay_minutes,
      DROP COLUMN IF EXISTS calling_hours_start,
      DROP COLUMN IF EXISTS calling_hours_end,
      DROP COLUMN IF EXISTS timezone,
      DROP COLUMN IF EXISTS agent_id,
      DROP COLUMN IF EXISTS stopped_at
    `);
  }
}
