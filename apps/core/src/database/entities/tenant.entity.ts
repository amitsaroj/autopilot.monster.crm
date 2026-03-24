import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'DELETED'],
    default: 'TRIAL',
  })
  status!: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'DELETED';

  @Column({ name: 'plan_id', nullable: true })
  planId?: string;

  @Column({ name: 'custom_domain', nullable: true })
  customDomain?: string;

  @Column({ type: 'jsonb', nullable: true })
  branding?: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
