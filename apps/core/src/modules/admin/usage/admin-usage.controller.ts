import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminUsageService } from './admin-usage.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Usage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/usage')
export class AdminUsageController {
  constructor(private readonly adminUsageService: AdminUsageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all usage records' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'metric', required: false })
  async findAll(@Query('tenantId') tenantId?: string, @Query('metric') metric?: string) {
    const data = await this.adminUsageService.findAll({ tenantId, metric });
    return {
      status: 200,
      message: 'Usage records retrieved',
      error: false,
      data,
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get usage summary by metric' })
  async getSummary() {
    const data = await this.adminUsageService.getSummary();
    return {
      status: 200,
      message: 'Usage summary retrieved',
      error: false,
      data,
    };
  }
}
