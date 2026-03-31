import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminBillingService } from './admin-billing.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/billing')
export class AdminBillingController {
  constructor(private readonly adminBillingService: AdminBillingService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get global billing settings' })
  async getSettings() {
    const data = await this.adminBillingService.getSettings();
    return {
      status: 200,
      message: 'Billing settings retrieved',
      error: false,
      data,
    };
  }

  @Post('settings')
  @ApiOperation({ summary: 'Update global billing settings' })
  async updateSettings(@Body() body: any) {
    const data = await this.adminBillingService.updateSettings(body);
    return {
      status: 200,
      message: 'Billing settings updated',
      error: false,
      data,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get billing overview stats' })
  async getStats() {
    const data = await this.adminBillingService.getStats();
    return {
      status: 200,
      message: 'Billing stats retrieved',
      error: false,
      data,
    };
  }
}
