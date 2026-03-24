import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plan } from './plan.entity';

@Entity('plan_limits')
export class PlanLimit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan?: Plan;

  @Column({ length: 100 })
  metric!: string; // e.g. 'contacts'

  @Column({ type: 'bigint' })
  value!: number; // -1 for unlimited

  @Column({
    type: 'enum',
    enum: ['DAILY', 'MONTHLY', 'TOTAL'],
    default: 'MONTHLY',
  })
  period!: 'DAILY' | 'MONTHLY' | 'TOTAL';
}
