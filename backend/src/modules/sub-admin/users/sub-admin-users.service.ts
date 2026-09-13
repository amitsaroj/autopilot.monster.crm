import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@autopilot/core/modules/auth/entities/user.entity';
import { UsersService } from '../../users/users.service';
import type { InviteUserDto } from '../../users/dto/users.dto';

@Injectable()
export class SubAdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(tenantId: string) {
    return this.userRepo.find({ where: { tenantId } });
  }

  async invite(tenantId: string, invitedBy: string, dto: InviteUserDto) {
    return this.usersService.inviteUser(tenantId, invitedBy, dto);
  }

  async remove(tenantId: string, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('User not found in this tenant context');
    return this.userRepo.softDelete(userId);
  }
}
