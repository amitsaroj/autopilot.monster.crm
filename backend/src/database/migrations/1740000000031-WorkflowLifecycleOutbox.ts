import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkflowLifecycleOutbox1740000000031 implements MigrationInterface {
  name = 'WorkflowLifecycleOutbox1740000000031';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE workflow_lifecycle_outbox (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id uuid NOT NULL,
      workflow_id uuid NOT NULL,
      execution_id uuid NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
      event varchar(64) NOT NULL CHECK (event IN ('workflow.started','workflow.completed','workflow.failed')),
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
      CONSTRAINT fk_workflow_lifecycle_outbox_workflow
        FOREIGN KEY (workflow_id) REFERENCES flows(id) ON DELETE CASCADE,
      CONSTRAINT uq_workflow_lifecycle_outbox_execution_event UNIQUE (tenant_id, execution_id, event_id)
    )`);
    await queryRunner.query(`CREATE INDEX idx_workflow_lifecycle_outbox_due
      ON workflow_lifecycle_outbox(status, next_attempt_at, created_at)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_workflow_lifecycle_outbox_due');
    await queryRunner.query('DROP TABLE IF EXISTS workflow_lifecycle_outbox');
  }
}
