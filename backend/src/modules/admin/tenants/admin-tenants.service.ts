import { Injectable } from '@nestjs/common';

import { TenantService } from '../../tenant/tenant.service';
import { CreateTenantDto } from '../../tenant/dto/create-tenant.dto';
import { TenantFilterDto } from '../../tenant/dto/tenant.dto';

@Injectable()
export class AdminTenantsService {
  constructor(private readonly tenantService: TenantService) {}

  findAll(filter: TenantFilterDto) {
    return this.tenantService.findAll(filter);
  }

  findOne(id: string) {
    return this.tenantService.findOne(id);
  }

  create(data: CreateTenantDto) {
    return this.tenantService.create(data);
  }

  update(id: string, data: Partial<CreateTenantDto>) {
    return this.tenantService.update(id, data);
  }

  suspend(id: string) {
    return this.tenantService.suspend(id);
  }

  activate(id: string) {
    return this.tenantService.activate(id);
  }

  remove(id: string) {
    return this.tenantService.remove(id);
  }
}
