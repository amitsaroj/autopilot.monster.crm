import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminConfigService } from './admin-config.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Platform Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/config')
export class AdminConfigController {
  constructor(private readonly configService: AdminConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all platform configurations' })
  async findAll() {
    const data = await this.configService.findAll();
    return { status: 200, message: 'Configuration retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update or create a platform configuration' })
  async update(@Body() data: { key: string; value: any; group?: string; isPublic?: boolean }) {
    const result = await this.configService.update(data);
    return { status: 200, message: 'Configuration updated', error: false, data: result };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a platform configuration' })
  async remove(@Param('key') key: string) {
    await this.configService.remove(key);
    return { status: 200, message: 'Configuration removed', error: false, data: null };
  }
}
