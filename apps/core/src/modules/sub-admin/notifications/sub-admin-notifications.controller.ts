import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminNotificationsService } from './sub-admin-notifications.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/notifications')
export class SubAdminNotificationsController {
  constructor(private readonly notificationsService: SubAdminNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for tenant' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.notificationsService.findAll(tenantId);
    return { status: 200, message: 'Notification manifold synchronized', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Send a targeted notification' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.notificationsService.create(tenantId, dto);
    return { status: 201, message: 'Notification vector established', error: false, data };
  }
}
