import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('leads')
export class Lead extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, default: 'NEW' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ type: 'text', nullable: true })
  aiSummary?: string;
}
