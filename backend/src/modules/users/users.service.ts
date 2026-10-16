import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from './users.repository';
import {
  UpdateUserDto,
  InviteUserDto,
  CreateTeamGroupDto,
  UpdateTeamGroupDto,
} from './dto/users.dto';
import { stripImmutableFields } from '../../database/base.repository';
import { UserEntity } from '../auth/entities/user.entity';
import { TeamGroup } from '../../database/entities/team-group.entity';
import { Invitation } from '../../database/entities/invitation.entity';
import { EVENT_NAMES } from '../../events/event.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    @InjectRepository(TeamGroup)
    private readonly groupRepository: Repository<TeamGroup>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string): Promise<UserEntity[]> {
    return this.usersRepo.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<UserEntity> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateUserDto,
    actorId?: string,
  ): Promise<UserEntity> {
    await this.findOne(id, tenantId);
    const updated = await this.usersRepo.update(id, tenantId, stripImmutableFields(dto));
    this.eventEmitter.emit(EVENT_NAMES.USER_UPDATED, {
      name: EVENT_NAMES.USER_UPDATED,
      tenantId,
      actorId: actorId ?? null,
      payload: { userId: id, changes: dto },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
    return updated;
  }

  async inviteUser(tenantId: string, invitedBy: string, dto: InviteUserDto): Promise<Invitation> {
    const role = await this.usersRepo.findInvitationRole(tenantId, dto.roleId);
    if (!role) throw new NotFoundException('Role not found in this tenant');
    const actorRoles = await this.usersRepo.findActorRoles(tenantId, invitedBy);
    if (
      role.name === 'SUPER_ADMIN' ||
      (!actorRoles.some((name) => ['SUPER_ADMIN', 'TENANT_ADMIN'].includes(name)) &&
        ['TENANT_ADMIN', 'ADMIN'].includes(role.name))
    ) {
      throw new ForbiddenException('Cannot invite a user with this role');
    }
    const existing = await this.usersRepo.findByEmail(dto.email, tenantId);
    if (existing) throw new ConflictException('User already exists in this tenant');

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await this.usersRepo.createInvitation({
      email: dto.email,
      tenantId,
      roleId: dto.roleId,
      invitedBy,
      token,
      expiresAt,
      status: 'PENDING',
    });

    this.eventEmitter.emit(EVENT_NAMES.USER_INVITED, {
      name: EVENT_NAMES.USER_INVITED,
      tenantId,
      actorId: invitedBy,
      payload: { invitationId: invitation.id, email: dto.email, roleId: dto.roleId },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });

    return invitation;
  }

  async getInvitations(tenantId: string): Promise<Invitation[]> {
    return this.usersRepo.findInvitations(tenantId);
  }

  // --- Team Groups ---
  async findAllGroups(tenantId: string) {
    return this.groupRepository.find({
      where: { tenantId },
      relations: ['members'],
    });
  }

  async findOneGroup(id: string, tenantId: string) {
    const group = await this.groupRepository.findOne({
      where: { id, tenantId },
      relations: ['members'],
    });
    if (!group) throw new NotFoundException('Team Group artifact not found');
    return group;
  }

  async createGroup(tenantId: string, dto: CreateTeamGroupDto) {
    await this.assertLeaderInTenant(tenantId, dto.leaderId);
    const group = this.groupRepository.create({ ...stripImmutableFields(dto), tenantId });
    return this.groupRepository.save(group);
  }

  async updateGroup(id: string, tenantId: string, dto: UpdateTeamGroupDto) {
    const group = await this.findOneGroup(id, tenantId);
    await this.assertLeaderInTenant(tenantId, dto.leaderId);
    Object.assign(group, stripImmutableFields(dto));
    return this.groupRepository.save(group);
  }

  private async assertLeaderInTenant(tenantId: string, leaderId?: string): Promise<void> {
    if (leaderId && !(await this.usersRepo.findById(leaderId, tenantId))) {
      throw new NotFoundException('Group leader not found in this tenant');
    }
  }

  async removeGroup(id: string, tenantId: string) {
    const group = await this.findOneGroup(id, tenantId);
    return this.groupRepository.remove(group);
  }
}
