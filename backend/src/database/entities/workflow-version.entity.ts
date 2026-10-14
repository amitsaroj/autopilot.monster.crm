import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/** Append-only publication snapshot. The workflow repository never updates versions. */
@Entity('workflow_versions')
@Index(['tenantId', 'flowId', 'definitionHash'], { unique: true })
export class WorkflowVersion extends BaseEntity {
  @Column({ name: 'flow_id', type: 'uuid' })
  flowId!: string;

  @Column({ name: 'schema_version', type: 'integer', default: 1 })
  schemaVersion!: number;

  @Column({ name: 'definition_hash', length: 64 })
  definitionHash!: string;

  @Column({ type: 'jsonb' })
  definition!: Record<string, unknown>;
}
