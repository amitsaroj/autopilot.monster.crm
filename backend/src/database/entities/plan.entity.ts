import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PlanFeature } from './plan-feature.entity';
import { PlanLimit } from './plan-limit.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2 })
  priceMonthly!: number;

  @Column({ name: 'price_annual', type: 'decimal', precision: 10, scale: 2 })
  priceAnnual!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ default: 'ACTIVE' })
  status!: 'ACTIVE' | 'ARCHIVED';

  @Column({ name: 'is_public', default: true })
  isPublic!: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'stripe_price_id_monthly', nullable: true })
  stripePriceIdMonthly?: string;

  @Column({ name: 'stripe_price_id_annual', nullable: true })
  stripePriceIdAnnual?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => PlanFeature, (feature) => feature.plan)
  features!: PlanFeature[];

  @OneToMany(() => PlanLimit, (limit) => limit.plan)
  limits!: PlanLimit[];
}
