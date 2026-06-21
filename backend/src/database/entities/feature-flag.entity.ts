import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('feature_flags')
@Index(['tenantId', 'key'], { unique: true })
export class FeatureFlag extends BaseEntity {
  @Column({ length: 100 })
  key!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  /** Plan slugs that get this feature, e.g. ["pro","enterprise"] */
  @Column({ name: 'allowed_plans', type: 'jsonb', default: '[]' })
  allowedPlans!: string[];

  /** Optional: percentage rollout (0-100) */
  @Column({ name: 'rollout_percentage', type: 'int', default: 100 })
  rolloutPercentage!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
