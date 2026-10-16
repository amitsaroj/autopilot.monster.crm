import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkflowReliability1740000000017 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS workflow_versions (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), tenant_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz, created_by uuid, updated_by uuid,
      flow_id uuid NOT NULL, schema_version integer NOT NULL DEFAULT 1,
      definition_hash varchar(64) NOT NULL, definition jsonb NOT NULL,
      CONSTRAINT workflow_version_hash UNIQUE (tenant_id, flow_id, definition_hash))`);
    await queryRunner.query(`ALTER TABLE flows ADD COLUMN IF NOT EXISTS published_version_id uuid`);
    await queryRunner.query(`ALTER TABLE workflow_executions
      ADD COLUMN IF NOT EXISTS input jsonb NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS output jsonb NOT NULL DEFAULT '{"steps":[]}',
      ADD COLUMN IF NOT EXISTS current_step_id varchar,
      ADD COLUMN IF NOT EXISTS version_id uuid,
      ADD COLUMN IF NOT EXISTS definition_snapshot jsonb,
      ADD COLUMN IF NOT EXISTS event_id varchar(200),
      ADD COLUMN IF NOT EXISTS resume_at timestamptz,
      ADD COLUMN IF NOT EXISTS pause_reason varchar,
      ADD COLUMN IF NOT EXISTS dispatch_generation integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lease_token uuid,
      ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz`);
    // Also supports installations which used entity synchronization instead of the original DDL.
    await queryRunner.query(`ALTER TABLE workflow_executions ALTER COLUMN status DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE workflow_executions ALTER COLUMN status TYPE varchar USING status::text`,
    );
    await queryRunner.query(
      `ALTER TABLE workflow_executions ALTER COLUMN status SET DEFAULT 'QUEUED'`,
    );
    await queryRunner.query(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema()
        AND table_name='workflow_executions' AND column_name='trigger_data') THEN
        UPDATE workflow_executions SET input=jsonb_build_object('eventName',trigger_type,'payload',trigger_data)
          WHERE input='{}'::jsonb;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema()
        AND table_name='workflow_executions' AND column_name='result') THEN
        UPDATE workflow_executions SET output=CASE WHEN result ? 'steps' THEN result
          ELSE jsonb_build_object('steps','[]'::jsonb,'legacyResult',result) END
          WHERE result IS NOT NULL AND output='{"steps":[]}'::jsonb;
      END IF;
    END $$`);
    await queryRunner.query(
      `UPDATE workflow_executions SET status='QUEUED' WHERE status='PENDING'`,
    );
    await queryRunner.query(`UPDATE workflow_executions e SET definition_snapshot=f.definition
      FROM flows f WHERE f.id=e.flow_id AND f.tenant_id=e.tenant_id AND e.definition_snapshot IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS workflow_execution_event
      ON workflow_executions(tenant_id,flow_id,event_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS workflow_execution_recovery
      ON workflow_executions(status,resume_at,lease_expires_at)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Preserve execution history and repaired legacy columns; remove only new reliability metadata.
    await queryRunner.query(`DROP INDEX IF EXISTS workflow_execution_event`);
    await queryRunner.query(`DROP INDEX IF EXISTS workflow_execution_recovery`);
    await queryRunner.query(`ALTER TABLE workflow_executions DROP COLUMN IF EXISTS version_id,
      DROP COLUMN IF EXISTS definition_snapshot, DROP COLUMN IF EXISTS event_id,
      DROP COLUMN IF EXISTS resume_at, DROP COLUMN IF EXISTS pause_reason,
      DROP COLUMN IF EXISTS dispatch_generation, DROP COLUMN IF EXISTS lease_token,
      DROP COLUMN IF EXISTS lease_expires_at`);
    await queryRunner.query(`ALTER TABLE flows DROP COLUMN IF EXISTS published_version_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS workflow_versions`);
  }
}
