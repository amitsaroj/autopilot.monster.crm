import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@autopilot/core/modules/auth/entities/user.entity';

@Injectable()
export class AdminUserOverrideService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getOverrides(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return (user.metadata?.overrides as any) || { features: {}, limits: {} };
  }

  async setOverrides(userId: string, overrides: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    user.metadata = {
      ...user.metadata,
      overrides,
    };
    return this.userRepo.save(user);
  }
}
