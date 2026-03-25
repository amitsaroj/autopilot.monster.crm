import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '@autopilot/core/database/entities/permission.entity';

@Injectable()
export class AdminPermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async findAll() {
    return this.permissionRepo.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findOne(id: string) {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async create(data: any) {
    const permission = this.permissionRepo.create(data);
    return this.permissionRepo.save(permission);
  }

  async remove(id: string) {
    const permission = await this.findOne(id);
    return this.permissionRepo.remove(permission);
  }
}
