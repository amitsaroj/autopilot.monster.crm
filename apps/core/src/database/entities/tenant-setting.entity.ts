import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('tenant_settings')
@Index(['tenantId', 'key'], { unique: true })
export class TenantSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: string;

  @Column({ length: 100 })
  key!: string;

  @Column({ type: 'jsonb' })
  value!: any;

  @Column({ length: 50, default: 'GENERAL' })
  group!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
