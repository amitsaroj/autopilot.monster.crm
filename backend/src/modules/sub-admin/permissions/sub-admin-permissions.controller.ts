import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminPermissionsService } from './sub-admin-permissions.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('SubAdmin / Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/permissions')
export class SubAdminPermissionsController {
  constructor(private readonly permissionsService: SubAdminPermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available permissions (catalog)' })
  async findAll() {
    const data = await this.permissionsService.findAll();
    return { status: 200, message: 'Permission catalog retrieved', error: false, data };
  }
}
