import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPlansService } from './admin-plans.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Plans')
@ResourcePermissions('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/plans')
export class AdminPlansController {
  constructor(private readonly adminPlansService: AdminPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  async findAll() {
    return await this.adminPlansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan details' })
  async findOne(@Param('id') id: string) {
    return await this.adminPlansService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  async create(@Body() body: any) {
    return await this.adminPlansService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.adminPlansService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan' })
  async remove(@Param('id') id: string) {
    await this.adminPlansService.remove(id);
    return null;
  }
}
