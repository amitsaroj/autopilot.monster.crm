import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPricingService } from './admin-pricing.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Pricing Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/pricing-settings')
export class AdminPricingController {
  constructor(private readonly adminPricingService: AdminPricingService) {}

  @Get()
  @ApiOperation({ summary: 'Get global pricing settings' })
  async getSettings() {
    const data = await this.adminPricingService.getSettings();
    return {
      status: 200,
      message: 'Pricing settings retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Update global pricing settings' })
  async updateSettings(@Body() body: any) {
    const data = await this.adminPricingService.updateSettings(body);
    return {
      status: 200,
      message: 'Pricing settings updated',
      error: false,
      data,
    };
  }
}
