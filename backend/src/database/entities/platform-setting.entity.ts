import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryColumn({ length: 100 })
  key!: string;

  @Column({ type: 'jsonb' })
  value!: any;

  @Column({ length: 50, default: 'GENERAL' })
  group!: string;

  @Column({ name: 'is_public', default: false })
  isPublic!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
