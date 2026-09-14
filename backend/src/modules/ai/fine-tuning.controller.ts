import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { FineTuningService } from './fine-tuning.service';
import { CreateFineTuningJobDto, UpdateFineTuningJobDto } from './dto/fine-tuning.dto';

@ApiTags('AI Fine-Tuning')
@ResourcePermissions('ai')
@PlanFeature('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/fine-tuning')
export class FineTuningController {
  constructor(private readonly fineTuningService: FineTuningService) {}

  @Get()
  @ApiOperation({ summary: 'List fine-tuning jobs' })
  async list(@TenantId() tenantId: string) {
    return await this.fineTuningService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create fine-tuning job' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateFineTuningJobDto) {
    return await this.fineTuningService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fine-tuning job detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.fineTuningService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fine-tuning job' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFineTuningJobDto,
  ) {
    return await this.fineTuningService.update(tenantId, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel fine-tuning job' })
  async cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.fineTuningService.cancel(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete fine-tuning job' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.fineTuningService.remove(tenantId, id);
    return null;
  }
}
