import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminBillingService } from './admin-billing.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Billing')
@ResourcePermissions('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/billing')
export class AdminBillingController {
  constructor(private readonly adminBillingService: AdminBillingService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get global billing settings' })
  async getSettings() {
    return await this.adminBillingService.getSettings();
  }

  @Post('settings')
  @ApiOperation({ summary: 'Update global billing settings' })
  async updateSettings(@Body() body: any) {
    return await this.adminBillingService.updateSettings(body);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get billing overview stats' })
  async getStats() {
    return await this.adminBillingService.getStats();
  }
}
