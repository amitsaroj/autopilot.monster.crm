import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPricingService } from './admin-pricing.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Pricing Settings')
@ResourcePermissions('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/pricing-settings')
export class AdminPricingController {
  constructor(private readonly adminPricingService: AdminPricingService) {}

  @Get()
  @ApiOperation({ summary: 'Get global pricing settings' })
  async getSettings() {
    return await this.adminPricingService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global pricing settings' })
  async updateSettings(@Body() body: any) {
    return await this.adminPricingService.updateSettings(body);
  }
}
