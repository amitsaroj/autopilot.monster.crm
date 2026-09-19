import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoiceProviderAndDisposition1740000000012 implements MigrationInterface {
  name = 'VoiceProviderAndDisposition1740000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voice_calls
      ADD COLUMN IF NOT EXISTS provider varchar(30) NOT NULL DEFAULT 'twilio',
      ADD COLUMN IF NOT EXISTS answered_by varchar(30) NULL,
      ADD COLUMN IF NOT EXISTS recording_object_key varchar(255) NULL,
      ADD COLUMN IF NOT EXISTS transferred_to_human boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE voice_campaigns
      ADD COLUMN IF NOT EXISTS provider varchar(30) NOT NULL DEFAULT 'twilio',
      ADD COLUMN IF NOT EXISTS voicemail_action varchar(20) NOT NULL DEFAULT 'CONTINUE',
      ADD COLUMN IF NOT EXISTS human_transfer_number varchar(20) NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum WHERE enumlabel = 'VOICEMAIL'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'voice_campaign_recipients_status_enum')
        ) THEN
          ALTER TYPE voice_campaign_recipients_status_enum ADD VALUE 'VOICEMAIL';
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voice_campaign_recipients_disposition_enum') THEN
          CREATE TYPE voice_campaign_recipients_disposition_enum AS ENUM (
            'INTERESTED', 'NOT_INTERESTED', 'CALLBACK_REQUESTED', 'QUALIFIED',
            'NOT_QUALIFIED', 'WRONG_NUMBER', 'DO_NOT_CALL', 'CONVERTED'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE voice_campaign_recipients
      ADD COLUMN IF NOT EXISTS disposition voice_campaign_recipients_disposition_enum NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voice_campaign_recipients
      DROP COLUMN IF EXISTS disposition
    `);
    await queryRunner.query(`DROP TYPE IF EXISTS voice_campaign_recipients_disposition_enum`);
    await queryRunner.query(`
      ALTER TABLE voice_campaigns
      DROP COLUMN IF EXISTS provider,
      DROP COLUMN IF EXISTS voicemail_action,
      DROP COLUMN IF EXISTS human_transfer_number
    `);
    await queryRunner.query(`
      ALTER TABLE voice_calls
      DROP COLUMN IF EXISTS provider,
      DROP COLUMN IF EXISTS answered_by,
      DROP COLUMN IF EXISTS recording_object_key,
      DROP COLUMN IF EXISTS transferred_to_human
    `);
  }
}
