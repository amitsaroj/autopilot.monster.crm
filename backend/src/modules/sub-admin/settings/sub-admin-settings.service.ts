import { Injectable } from '@nestjs/common';
import { TenantService } from '../../tenant/tenant.service';
import { UpdateWorkspaceSettingsDto } from '../../tenant/dto/tenant.dto';

@Injectable()
export class SubAdminSettingsService {
  constructor(private readonly tenantService: TenantService) {}

  async getSettings(tenantId: string) {
    return this.tenantService.findOne(tenantId);
  }

  async updateSettings(tenantId: string, dto: UpdateWorkspaceSettingsDto) {
    return this.tenantService.updateWorkspace(tenantId, dto);
  }
}
