import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('storage_files')
@Index(['tenantId', 'objectKey'], { unique: true })
export class StorageFile extends BaseEntity {
  @Column({ length: 255 })
  filename!: string;

  @Column({ name: 'object_key', length: 500 })
  objectKey!: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint', default: 0 })
  size!: number;

  @Column({ length: 100 })
  bucket!: string;
}
