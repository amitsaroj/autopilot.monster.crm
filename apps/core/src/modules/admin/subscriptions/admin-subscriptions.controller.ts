import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/subscriptions')
export class AdminSubscriptionsController {
  constructor(private readonly adminSubscriptionsService: AdminSubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('tenantId') tenantId?: string, @Query('status') status?: string) {
    const data = await this.adminSubscriptionsService.findAll({ tenantId, status });
    return {
      status: 200,
      message: 'Subscriptions retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription details' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminSubscriptionsService.findOne(id);
    return {
      status: 200,
      message: 'Subscription retrieved',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription (status, plan, etc.)' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminSubscriptionsService.update(id, body);
    return {
      status: 200,
      message: 'Subscription updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/Delete subscription' })
  async remove(@Param('id') id: string) {
    await this.adminSubscriptionsService.remove(id);
    return {
      status: 200,
      message: 'Subscription deleted',
      error: false,
      data: null,
    };
  }
}
