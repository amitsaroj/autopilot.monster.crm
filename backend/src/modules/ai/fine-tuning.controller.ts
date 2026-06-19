import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
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
    const data = await this.fineTuningService.findAll(tenantId);
    return { status: 200, message: 'Fine-tuning jobs retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create fine-tuning job' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateFineTuningJobDto) {
    const data = await this.fineTuningService.create(tenantId, dto);
    return { status: 201, message: 'Fine-tuning job created', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fine-tuning job detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.fineTuningService.findOne(tenantId, id);
    return { status: 200, message: 'Fine-tuning job retrieved', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fine-tuning job' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFineTuningJobDto,
  ) {
    const data = await this.fineTuningService.update(tenantId, id, dto);
    return { status: 200, message: 'Fine-tuning job updated', error: false, data };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel fine-tuning job' })
  async cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.fineTuningService.cancel(tenantId, id);
    return { status: 200, message: 'Fine-tuning job cancelled', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete fine-tuning job' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.fineTuningService.remove(tenantId, id);
    return { status: 200, message: 'Fine-tuning job deleted', error: false, data: null };
  }
}
