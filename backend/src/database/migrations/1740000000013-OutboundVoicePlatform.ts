import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutboundVoicePlatform1740000000013 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE voice_campaigns ADD COLUMN IF NOT EXISTS configuration jsonb NOT NULL DEFAULT '{}'`);
    await q.query(`ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS lifecycle jsonb NOT NULL DEFAULT '{}'`);
    await q.query(`ALTER TABLE voice_campaign_recipients ALTER COLUMN contact_id DROP NOT NULL`);
    await q.query(`ALTER TABLE voice_campaign_recipients ADD COLUMN IF NOT EXISTS lead_id uuid`);
    for (const [table, columns] of [
      ['voice_provider_configs', "provider varchar NOT NULL, credentials text NOT NULL, settings jsonb NOT NULL DEFAULT '{}', UNIQUE(tenant_id, provider)"],
      ['voice_suppressions', 'phone varchar NOT NULL, reason varchar NOT NULL, UNIQUE(tenant_id, phone)'],
      ['voice_call_events', 'call_id uuid NOT NULL, event_key varchar NOT NULL, payload jsonb NOT NULL, processed boolean NOT NULL DEFAULT false, error text, UNIQUE(tenant_id, event_key)'],
    ]) {
      await q.query(`CREATE TABLE IF NOT EXISTS ${table} (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz, created_by uuid, updated_by uuid, ${columns})`);
    }
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS voice_recipient_phone_unique ON voice_campaign_recipients (tenant_id, campaign_id, phone)`);
    await q.query(`CREATE INDEX IF NOT EXISTS voice_dispatch_idx ON voice_campaign_recipients (tenant_id, campaign_id, status, next_attempt_at)`);
    await q.query(`CREATE INDEX IF NOT EXISTS voice_call_campaign_idx ON voice_calls (tenant_id, campaign_id, created_at)`);
    await q.query(`CREATE INDEX IF NOT EXISTS voice_event_pending_idx ON voice_call_events (processed, created_at)`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS voice_call_events, voice_suppressions, voice_provider_configs');
    await q.query('DROP INDEX IF EXISTS voice_recipient_phone_unique');
    await q.query('DROP INDEX IF EXISTS voice_dispatch_idx');
    await q.query('DROP INDEX IF EXISTS voice_call_campaign_idx');
    await q.query('ALTER TABLE voice_campaign_recipients DROP COLUMN IF EXISTS lead_id');
    await q.query('ALTER TABLE voice_calls DROP COLUMN IF EXISTS lifecycle');
    await q.query('ALTER TABLE voice_campaigns DROP COLUMN IF EXISTS configuration');
  }
}
