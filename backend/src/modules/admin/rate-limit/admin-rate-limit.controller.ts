import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRateLimitService } from './admin-rate-limit.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Rate Limiting')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/rate-limit')
export class AdminRateLimitController {
  constructor(private readonly rateLimitService: AdminRateLimitService) {}

  @Get()
  @ApiOperation({ summary: 'Get global rate limit settings' })
  async getSettings() {
    return await this.rateLimitService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global rate limit settings' })
  async updateSettings(@Body() settings: any) {
    return await this.rateLimitService.updateSettings(settings);
  }
}
