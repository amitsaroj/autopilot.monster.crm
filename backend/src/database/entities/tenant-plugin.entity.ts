import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { Plugin } from './plugin.entity';

@Entity('tenant_plugins')
export class TenantPlugin extends BaseEntity {
  @Column()
  tenantId!: string;

  @Column()
  pluginId!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => Plugin)
  @JoinColumn({ name: 'pluginId' })
  plugin!: Plugin;

  @Column({ type: 'jsonb', nullable: true })
  config!: any;

  @Column({ default: 'ENABLED' })
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt!: Date;
}
