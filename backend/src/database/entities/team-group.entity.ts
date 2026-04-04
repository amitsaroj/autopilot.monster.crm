import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from '../../modules/auth/entities/user.entity';

@Entity('team_groups')
@Index(['tenantId', 'name'])
export class TeamGroup extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'leader_id', type: 'uuid', nullable: true })
  leaderId?: string;

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'team_group_members',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  members!: UserEntity[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;
}
