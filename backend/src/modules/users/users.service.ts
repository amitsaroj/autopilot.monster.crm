import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UpdateUserDto, InviteUserDto } from './dto/users.dto';
import { UserEntity } from '../auth/entities/user.entity';
import { TeamGroup } from '../../database/entities/team-group.entity';
import { Invitation } from '../../database/entities/invitation.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    @InjectRepository(TeamGroup)
    private readonly groupRepository: Repository<TeamGroup>,
  ) {}

  async findAll(tenantId: string): Promise<UserEntity[]> {
    return this.usersRepo.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<UserEntity> {
    const user = await this.usersRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto): Promise<UserEntity> {
    await this.findOne(id, tenantId);
    return this.usersRepo.update(id, tenantId, dto as any);
  }

  async inviteUser(tenantId: string, invitedBy: string, dto: InviteUserDto): Promise<Invitation> {
    const existing = await this.usersRepo.findByEmail(dto.email, tenantId);
    if (existing) throw new ConflictException('User already exists in this tenant');

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return this.usersRepo.createInvitation({
      email: dto.email,
      tenantId,
      roleId: dto.roleId,
      invitedBy,
      token,
      expiresAt,
      status: 'PENDING',
    });
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

  async createGroup(tenantId: string, dto: any) {
    const group = this.groupRepository.create({ ...dto, tenantId });
    return this.groupRepository.save(group);
  }

  async updateGroup(id: string, tenantId: string, dto: any) {
    const group = await this.findOneGroup(id, tenantId);
    Object.assign(group, dto);
    return this.groupRepository.save(group);
  }

  async removeGroup(id: string, tenantId: string) {
    const group = await this.findOneGroup(id, tenantId);
    return this.groupRepository.remove(group);
  }
}
