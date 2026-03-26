import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../../auth/src/entities/user.entity';

@Injectable()
export class SubAdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll(tenantId: string) {
    return this.userRepo.find({ where: { tenantId } });
  }

  async invite(tenantId: string, dto: any) {
    return { ...dto, tenantId, status: 'PENDING' };
  }

  async remove(tenantId: string, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('User not found in this tenant context');
    return this.userRepo.softDelete(userId);
  }
}
