import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../auth/src/entities/user.entity';
import { Invitation } from '../../database/entities/invitation.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
  ) {}

  async findAll(tenantId: string): Promise<UserEntity[]> {
    return this.userRepo.find({ where: { tenantId } });
  }

  async findById(id: string, tenantId: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id, tenantId } });
  }

  async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { email, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<UserEntity>): Promise<UserEntity> {
    await this.userRepo.update({ id, tenantId }, data as any);
    return this.findById(id, tenantId) as Promise<UserEntity>;
  }

  async createInvitation(data: Partial<Invitation>): Promise<Invitation> {
    const invitation = this.invitationRepo.create(data);
    return this.invitationRepo.save(invitation);
  }

  async findInvitations(tenantId: string): Promise<Invitation[]> {
    return this.invitationRepo.find({ where: { tenantId } });
  }

  async findInvitationByToken(token: string): Promise<Invitation | null> {
    return this.invitationRepo.findOne({ where: { token, status: 'PENDING' } });
  }

  async updateInvitationStatus(id: string, status: Invitation['status']): Promise<void> {
    await this.invitationRepo.update(id, { status });
  }
}
