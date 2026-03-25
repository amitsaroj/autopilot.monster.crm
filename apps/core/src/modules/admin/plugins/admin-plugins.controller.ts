import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPluginsService } from './admin-plugins.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/plugins')
export class AdminPluginsController {
  constructor(private readonly pluginsService: AdminPluginsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all installed plugins' })
  async findAll() {
    const data = await this.pluginsService.findAll();
    return {
      status: 200,
      message: 'Plugins retrieved',
      error: false,
      data,
    };
  }
}
