import { Controller, Get, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminIpWhitelistService } from './admin-ip-whitelist.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / IP Whitelist')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/ip-whitelist')
export class AdminIpWhitelistController {
  constructor(private readonly ipService: AdminIpWhitelistService) {}

  @Get()
  @ApiOperation({ summary: 'Get global IP whitelist' })
  async getWhitelist() {
    return await this.ipService.getWhitelist();
  }

  @Post()
  @ApiOperation({ summary: 'Add IP to whitelist' })
  async addIp(@Body() data: { ip: string; description?: string }) {
    return await this.ipService.addIp(data.ip, data.description);
  }

  @Delete(':ip')
  @ApiOperation({ summary: 'Remove IP from whitelist' })
  async removeIp(@Param('ip') ip: string) {
    await this.ipService.removeIp(ip);
    return null;
  }
}
