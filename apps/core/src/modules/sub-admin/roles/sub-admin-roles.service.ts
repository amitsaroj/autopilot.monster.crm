import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../database/entities/role.entity';

@Injectable()
export class SubAdminRolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll(tenantId: string) {
    return this.roleRepo.find({ where: { tenantId } });
  }

  async create(tenantId: string, dto: any) {
    const role = this.roleRepo.create({ ...dto, tenantId });
    return this.roleRepo.save(role);
  }

  async remove(tenantId: string, roleId: string) {
    const role = await this.roleRepo.findOne({ where: { id: roleId, tenantId } });
    if (!role) throw new NotFoundException('Role not found in this tenant context');
    return this.roleRepo.delete(roleId);
  }
}
