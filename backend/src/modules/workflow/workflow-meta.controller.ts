import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { WorkflowService } from './workflow.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { ResourcePermissions, TenantId } from '../../common/decorators';
import { PlanFeature } from '../../common/decorators/plan-feature.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('workflow')
@PlanFeature('workflow')
@Controller()
export class WorkflowMetaController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('workflow-triggers')
  @ApiOperation({ summary: 'List available workflow trigger types' })
  getTriggers(@TenantId() tenantId: string) {
    return this.workflowService.getTriggerTypes(tenantId);
  }

  @Get('workflow-actions')
  @ApiOperation({ summary: 'List available workflow action types' })
  getActions() {
    return this.workflowService.getActionTypes();
  }
}
