import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions } from '../../common/decorators';
import { UpdateNotificationPreferencesDto } from '../tenant-settings/dto/developer-settings.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(@TenantId() tenantId: string) {
    return await this.notificationService.findAll(tenantId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async readAll(@TenantId() tenantId: string) {
    return await this.notificationService.readAll(tenantId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  async getPreferences(@TenantId() tenantId: string) {
    return await this.notificationService.getPreferences(tenantId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  async updatePreferences(
    @TenantId() tenantId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return await this.notificationService.updatePreferences(tenantId, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.notificationService.markAsRead(tenantId, id);
  }
}
