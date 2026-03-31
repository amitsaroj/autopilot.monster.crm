import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminWorkflowsService } from './sub-admin-workflows.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/workflows')
export class SubAdminWorkflowsController {
  constructor(private readonly workflowsService: SubAdminWorkflowsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workflows for tenant' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.workflowsService.findAll(tenantId);
    return { status: 200, message: 'Workflow manifold synchronized', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.workflowsService.create(tenantId, dto);
    return { status: 201, message: 'Workflow vector established', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Abolish a workflow' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.workflowsService.remove(tenantId, id);
    return { status: 200, message: 'Workflow vector severed', error: false };
  }
}
