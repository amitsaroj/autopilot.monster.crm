import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TenantPlugin } from './tenant-plugin.entity';

@Entity('plugins')
export class Plugin extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  version!: string;

  @Column({ nullable: true })
  author!: string;

  @Column({ nullable: true })
  icon!: string;

  @Column({ type: 'jsonb', nullable: true })
  configSchema!: any;

  @Column({ default: false })
  isPremium!: boolean;

  @Column({ default: 'ACTIVE' })
  status!: string;

  @Column({ nullable: true })
  category!: string;

  @OneToMany(() => TenantPlugin, (tenantPlugin) => tenantPlugin.plugin)
  tenantPlugins!: TenantPlugin[];
}
