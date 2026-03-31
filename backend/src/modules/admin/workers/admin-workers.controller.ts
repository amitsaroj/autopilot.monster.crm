import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminWorkersService } from './admin-workers.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/workers')
export class AdminWorkersController {
  constructor(private readonly workersService: AdminWorkersService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get worker cluster status' })
  async getWorkersStatus() {
    const data = await this.workersService.getWorkersStatus();
    return {
      status: 200,
      message: 'Workers status retrieved',
      error: false,
      data,
    };
  }
}
