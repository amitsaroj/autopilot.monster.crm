import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminNotificationsService } from './sub-admin-notifications.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Notifications')
@ApiBearerAuth()
@ResourcePermissions('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/notifications')
export class SubAdminNotificationsController {
  constructor(private readonly notificationsService: SubAdminNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for tenant' })
  async findAll(@TenantId() tenantId: string) {
    return await this.notificationsService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Send a targeted notification' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.notificationsService.create(tenantId, dto);
  }
}
