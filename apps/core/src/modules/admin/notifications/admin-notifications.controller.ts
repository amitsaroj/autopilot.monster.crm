import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminNotificationsService } from './admin-notifications.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: AdminNotificationsService) {}

  @Post('broadcast')
  @ApiOperation({ summary: 'Send a broadcast notification to all users' })
  async broadcast(@Body() data: { title: string; message: string; type?: string }) {
    const result = await this.notificationsService.broadcast(data);
    return {
      status: 201,
      message: 'Broadcast notification initiated',
      error: false,
      data: result,
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get global notification history' })
  async getHistory() {
    const data = await this.notificationsService.getHistory();
    return {
      status: 200,
      message: 'Notification history retrieved',
      error: false,
      data,
    };
  }
}
