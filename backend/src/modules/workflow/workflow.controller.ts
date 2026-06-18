import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/workflow.dto';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  findAll(@TenantId() tenantId: string) {
    return this.workflowService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @Roles('TENANT_ADMIN')
  create(@TenantId() tenantId: string, @Body() dto: CreateWorkflowDto) {
    return this.workflowService.create(tenantId, dto);
  }

  @Get('executions/:execId')
  @ApiOperation({ summary: 'Get workflow execution detail' })
  getExecution(@TenantId() tenantId: string, @Param('execId') execId: string) {
    return this.workflowService.getExecution(tenantId, execId);
  }

  @Get('executions')
  @ApiOperation({ summary: 'Get workflow execution history' })
  getExecutions(@TenantId() tenantId: string) {
    return this.workflowService.getExecutions(tenantId);
  }

  @Get('workflow-triggers')
  @ApiOperation({ summary: 'List available workflow trigger types' })
  getTriggers() {
    return this.workflowService.getTriggerTypes();
  }

  @Get('workflow-actions')
  @ApiOperation({ summary: 'List available workflow action types' })
  getActions() {
    return this.workflowService.getActionTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workflowService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @Roles('TENANT_ADMIN')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkflowDto>,
  ) {
    return this.workflowService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @Roles('TENANT_ADMIN')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workflowService.remove(tenantId, id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate workflow' })
  @Roles('TENANT_ADMIN')
  activate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workflowService.activate(tenantId, id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate workflow' })
  @Roles('TENANT_ADMIN')
  deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workflowService.deactivate(tenantId, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate workflow' })
  @Roles('TENANT_ADMIN')
  duplicate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workflowService.duplicate(tenantId, id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Manually trigger workflow' })
  trigger(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.workflowService.triggerWorkflow(tenantId, `manual_${id}`, payload);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Manually trigger workflow execution (legacy)' })
  execute(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: Record<string, unknown>) {
    return this.workflowService.triggerWorkflow(tenantId, `manual_${id}`, payload);
  }
}
