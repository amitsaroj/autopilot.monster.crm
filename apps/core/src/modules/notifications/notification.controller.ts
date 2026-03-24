import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  findAll(@TenantId() tenantId: string) {
    return this.notificationService.findAll(tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(tenantId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  readAll(@TenantId() tenantId: string) {
    return this.notificationService.readAll(tenantId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  getPreferences(@TenantId() tenantId: string) {
    return this.notificationService.getPreferences(tenantId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  updatePreferences(@TenantId() tenantId: string, @Body() dto: any) {
    return this.notificationService.updatePreferences(tenantId, dto);
  }
}
