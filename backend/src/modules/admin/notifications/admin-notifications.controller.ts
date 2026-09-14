import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminNotificationsService } from './admin-notifications.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Notifications')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: AdminNotificationsService) {}

  @Post('broadcast')
  @ApiOperation({ summary: 'Send a broadcast notification to all users' })
  async broadcast(@Body() data: { title: string; message: string; type?: string }) {
    return await this.notificationsService.broadcast(data);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get global notification history' })
  async getHistory() {
    return await this.notificationsService.getHistory();
  }
}
