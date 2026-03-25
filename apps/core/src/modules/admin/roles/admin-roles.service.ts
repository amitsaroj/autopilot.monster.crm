import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@autopilot/core/database/entities/role.entity';

@Injectable()
export class AdminRolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll() {
    return this.roleRepo.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: any) {
    const role = this.roleRepo.create(data);
    return this.roleRepo.save(role);
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    await this.roleRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    return this.roleRepo.remove(role);
  }
}
