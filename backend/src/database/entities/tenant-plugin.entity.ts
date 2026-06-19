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

  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>;

  @Column({ name: 'is_enabled', default: true })
  isEnabled!: boolean;

  @Column({ name: 'installed_at', type: 'timestamptz', nullable: true })
  installedAt?: Date;
}
