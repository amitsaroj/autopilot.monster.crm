import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plan } from './plan.entity';

@Entity('plan_features')
export class PlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan?: Plan;

  @Column({ name: 'feature_key', length: 100 })
  featureKey!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  config!: Record<string, any>;
}
