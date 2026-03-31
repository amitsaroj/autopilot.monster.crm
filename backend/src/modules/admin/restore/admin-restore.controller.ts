import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRestoreService } from './admin-restore.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Platform Recovery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/restore')
export class AdminRestoreController {
  constructor(private readonly restoreService: AdminRestoreService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a platform restore from backup' })
  async initiate(@Body() data: { backupId: string }) {
    const result = await this.restoreService.initiate(data.backupId);
    return {
      status: 200,
      message: 'Restore process initiated',
      error: false,
      data: result,
    };
  }
}
