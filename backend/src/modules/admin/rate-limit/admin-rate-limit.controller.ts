import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRateLimitService } from './admin-rate-limit.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Rate Limiting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/rate-limit')
export class AdminRateLimitController {
  constructor(private readonly rateLimitService: AdminRateLimitService) {}

  @Get()
  @ApiOperation({ summary: 'Get global rate limit settings' })
  async getSettings() {
    const data = await this.rateLimitService.getSettings();
    return { status: 200, message: 'Rate limit settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global rate limit settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.rateLimitService.updateSettings(settings);
    return { status: 200, message: 'Rate limit settings updated', error: false, data };
  }
}
