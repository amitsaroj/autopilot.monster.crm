import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminConfigService } from './admin-config.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Platform Configuration')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/config')
export class AdminConfigController {
  constructor(private readonly configService: AdminConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all platform configurations' })
  async findAll() {
    return await this.configService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Update or create a platform configuration' })
  async update(@Body() data: { key: string; value: any; group?: string; isPublic?: boolean }) {
    return await this.configService.update(data);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a platform configuration' })
  async remove(@Param('key') key: string) {
    await this.configService.remove(key);
    return null;
  }
}
