import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('api_logs')
@Index(['tenantId', 'method', 'url'])
export class ApiLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ length: 10 })
  method!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ name: 'status_code', type: 'integer' })
  statusCode!: number;

  @Column({ name: 'duration_ms', type: 'integer' })
  durationMs!: number;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders?: any;

  @Column({ type: 'jsonb', nullable: true })
  requestBody?: any;

  @Column({ type: 'jsonb', nullable: true })
  responseBody?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
