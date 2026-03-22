import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('agents')
export class Agent extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'shimmer' })
  voice!: string;

  @Column({ type: 'text', nullable: true })
  systemPrompt?: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration?: any;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
