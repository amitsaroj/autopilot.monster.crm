import { assertCustomRoleName, assertMutableRole } from '../../../common/utils/role-policy';
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
    assertCustomRoleName(dto.name);
    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description,
      tenantId,
      isSystem: false,
    });
    return this.roleRepo.save(role);
  }

  async remove(tenantId: string, roleId: string) {
    const role = await this.roleRepo.findOne({ where: { id: roleId, tenantId } });
    if (!role) throw new NotFoundException('Role not found in this tenant context');
    assertMutableRole(role);
    return this.roleRepo.delete({ id: roleId, tenantId });
  }
}
