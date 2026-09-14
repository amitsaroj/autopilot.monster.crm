import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPluginsService } from './admin-plugins.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Plugins')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/plugins')
export class AdminPluginsController {
  constructor(private readonly pluginsService: AdminPluginsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all installed plugins' })
  async findAll() {
    return await this.pluginsService.findAll();
  }
}
