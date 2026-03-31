import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll(options: { search?: string; tenantId?: string }) {
    const where: any = {};
    if (options.search) {
      where.email = Like(`%${options.search}%`);
    }
    if (options.tenantId) {
      where.tenantId = options.tenantId;
    }
    return this.userRepo.find({
      where,
      relations: ['tenant', 'roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['tenant', 'roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepo.remove(user);
  }
}
