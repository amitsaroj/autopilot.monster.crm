import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { CreateScheduledJobDto, UpdateScheduledJobDto } from './dto/scheduler.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Scheduler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new scheduled job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  create(@TenantId() tenantId: string, @Body() dto: CreateScheduledJobDto) {
    return this.schedulerService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all scheduled jobs for tenant' })
  findAll(@TenantId() tenantId: string) {
    return this.schedulerService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.schedulerService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Update a scheduled job' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduledJobDto,
  ) {
    return this.schedulerService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Delete a scheduled job' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.schedulerService.remove(tenantId, id);
  }
}
