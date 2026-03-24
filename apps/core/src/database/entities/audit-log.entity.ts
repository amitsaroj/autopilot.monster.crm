import { Entity, Column, Index, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
@Index(['tenantId', 'action'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ length: 100 })
  action!: string; // e.g. 'contact.created'

  @Column({ length: 100 })
  resource!: string; // e.g. 'contact'

  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', default: '{}' })
  changes!: any;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
