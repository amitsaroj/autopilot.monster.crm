import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_system', default: false })
  isSystem!: boolean;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];
}
