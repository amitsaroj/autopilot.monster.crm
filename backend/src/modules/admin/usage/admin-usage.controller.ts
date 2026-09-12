import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminUsageService } from './admin-usage.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Usage')
@ResourcePermissions('admin')
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
    return await this.adminUsageService.findAll({ tenantId, metric });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get usage summary by metric' })
  async getSummary() {
    return await this.adminUsageService.getSummary();
  }
}
