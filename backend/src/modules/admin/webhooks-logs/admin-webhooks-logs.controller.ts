import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminWebhooksLogsService } from './admin-webhooks-logs.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Webhooks Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/webhooks-logs')
export class AdminWebhooksLogsController {
  constructor(private readonly adminWebhooksLogsService: AdminWebhooksLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all outbound webhook delivery logs' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'webhookId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('webhookId') webhookId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.adminWebhooksLogsService.findAll({ tenantId, webhookId, status });
    return {
      status: 200,
      message: 'Webhook logs retrieved',
      error: false,
      data,
    };
  }
}
