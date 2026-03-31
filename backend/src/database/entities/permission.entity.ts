import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string; // e.g. 'contacts:write'

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'resource' })
  resource!: string; // e.g. 'contacts'

  @Column({ name: 'action' })
  action!: string; // e.g. 'write'

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
