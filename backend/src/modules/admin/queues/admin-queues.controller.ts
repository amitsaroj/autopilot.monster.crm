import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminQueuesService } from './admin-queues.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Queues')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/queues')
export class AdminQueuesController {
  constructor(private readonly queuesService: AdminQueuesService) {}

  @Get()
  @ApiOperation({ summary: 'Get status of all system queues' })
  async getQueuesStatus() {
    return await this.queuesService.getQueuesStatus();
  }

  @Post(':queueName/clean')
  @ApiOperation({ summary: 'Clean completed/failed jobs from a queue' })
  async cleanQueue(@Param('queueName') queueName: string) {
    return await this.queuesService.cleanQueue(queueName);
  }
}
