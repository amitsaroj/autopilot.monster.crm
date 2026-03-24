import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get all platform settings' })
  getAllSettings() {
    return this.adminService.getAllSettings();
  }

  @Post('settings/:key')
  @ApiOperation({ summary: 'Update platform setting' })
  updateSetting(@Param('key') key: string, @Body() body: { value: any; group?: string }) {
    return this.adminService.updateSetting(key, body.value, body.group);
  }
}
