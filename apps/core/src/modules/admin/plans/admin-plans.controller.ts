import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPlansService } from './admin-plans.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/plans')
export class AdminPlansController {
  constructor(private readonly adminPlansService: AdminPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  async findAll() {
    const data = await this.adminPlansService.findAll();
    return {
      status: 200,
      message: 'Plans retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan details' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminPlansService.findOne(id);
    return {
      status: 200,
      message: 'Plan retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  async create(@Body() body: any) {
    const data = await this.adminPlansService.create(body);
    return {
      status: 201,
      message: 'Plan created',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminPlansService.update(id, body);
    return {
      status: 200,
      message: 'Plan updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan' })
  async remove(@Param('id') id: string) {
    await this.adminPlansService.remove(id);
    return {
      status: 200,
      message: 'Plan deleted',
      error: false,
      data: null,
    };
  }
}
