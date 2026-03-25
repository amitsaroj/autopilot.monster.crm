import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminEventsService } from './admin-events.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/events')
export class AdminEventsController {
  constructor(private readonly eventsService: AdminEventsService) {}

  @Get('definitions')
  @ApiOperation({ summary: 'Get all system event definitions' })
  async getEventDefinitions() {
    const data = await this.eventsService.getEventDefinitions();
    return {
      status: 200,
      message: 'Event definitions retrieved',
      error: false,
      data,
    };
  }
}
