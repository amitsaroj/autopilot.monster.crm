import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { UpdateNotificationPreferencesDto } from '../tenant-settings/dto/developer-settings.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.notificationService.findAll(tenantId);
    return { status: 200, message: 'Notifications retrieved', error: false, data };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async readAll(@TenantId() tenantId: string) {
    const data = await this.notificationService.readAll(tenantId);
    return { status: 200, message: 'All notifications marked as read', error: false, data };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  async getPreferences(@TenantId() tenantId: string) {
    const data = await this.notificationService.getPreferences(tenantId);
    return { status: 200, message: 'Preferences retrieved', error: false, data };
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  async updatePreferences(
    @TenantId() tenantId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const data = await this.notificationService.updatePreferences(tenantId, dto);
    return { status: 200, message: 'Preferences updated', error: false, data };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.notificationService.markAsRead(tenantId, id);
    return { status: 200, message: 'Notification marked as read', error: false, data };
  }
}
