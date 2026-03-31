import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminEnvironmentService } from './admin-environment.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Environment Visibility')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/environment')
export class AdminEnvironmentController {
  constructor(private readonly envService: AdminEnvironmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get redacted environment variables and system info' })
  async getEnv() {
    const data = await this.envService.getEnv();
    return { status: 200, message: 'Environment info retrieved', error: false, data };
  }
}
