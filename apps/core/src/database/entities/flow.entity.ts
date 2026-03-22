import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('flows')
export class Flow extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, default: 'voice' })
  type!: 'voice' | 'whatsapp';

  /** The React Flow JSON representation (nodes, edges) */
  @Column({ type: 'jsonb' })
  definition!: any;

  @Column({ type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
