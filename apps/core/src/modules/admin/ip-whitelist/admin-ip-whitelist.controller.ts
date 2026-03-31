import { Controller, Get, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminIpWhitelistService } from './admin-ip-whitelist.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / IP Whitelist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/ip-whitelist')
export class AdminIpWhitelistController {
  constructor(private readonly ipService: AdminIpWhitelistService) {}

  @Get()
  @ApiOperation({ summary: 'Get global IP whitelist' })
  async getWhitelist() {
    const data = await this.ipService.getWhitelist();
    return { status: 200, message: 'IP Whitelist retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Add IP to whitelist' })
  async addIp(@Body() data: { ip: string; description?: string }) {
    const result = await this.ipService.addIp(data.ip, data.description);
    return { status: 201, message: 'IP added to whitelist', error: false, data: result };
  }

  @Delete(':ip')
  @ApiOperation({ summary: 'Remove IP from whitelist' })
  async removeIp(@Param('ip') ip: string) {
    await this.ipService.removeIp(ip);
    return { status: 200, message: 'IP removed from whitelist', error: false, data: null };
  }
}
