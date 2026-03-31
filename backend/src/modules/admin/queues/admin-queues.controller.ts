import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminQueuesService } from './admin-queues.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Queues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/queues')
export class AdminQueuesController {
  constructor(private readonly queuesService: AdminQueuesService) {}

  @Get()
  @ApiOperation({ summary: 'Get status of all system queues' })
  async getQueuesStatus() {
    const data = await this.queuesService.getQueuesStatus();
    return {
      status: 200,
      message: 'Queues status retrieved',
      error: false,
      data,
    };
  }

  @Post(':queueName/clean')
  @ApiOperation({ summary: 'Clean completed/failed jobs from a queue' })
  async cleanQueue(@Param('queueName') queueName: string) {
    const data = await this.queuesService.cleanQueue(queueName);
    return {
      status: 200,
      message: `Queue ${queueName} cleaned`,
      error: false,
      data,
    };
  }
}
