import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('user_roles')
@Index(['userId', 'roleId', 'tenantId'], { unique: true })
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy?: string;
}
