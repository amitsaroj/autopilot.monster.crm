import {
  Controller, Get, Post, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DuplicateDetectionService } from '../duplicate-detection.service';
import { JwtAuthGuard, TenantGuard } from '../../../common/guards';
import { TenantId } from '../../../common/decorators';

@ApiTags('CRM - Duplicate Detection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('crm/duplicates')
export class DuplicateController {
  constructor(private readonly dupeService: DuplicateDetectionService) {}

  @Get()
  @ApiOperation({ summary: 'Scan for duplicate contacts' })
  async findDuplicates(@TenantId() tenantId: string) {
    return this.dupeService.findDuplicates(tenantId);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if a contact is a potential duplicate' })
  async checkDuplicate(
    @TenantId() tenantId: string,
    @Body() data: { email?: string; phone?: string; firstName?: string; lastName?: string },
  ) {
    return this.dupeService.checkForDuplicate(tenantId, data);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge two duplicate contacts' })
  async merge(
    @TenantId() tenantId: string,
    @Body() body: { primaryId: string; secondaryId: string },
  ) {
    return this.dupeService.mergeContacts(tenantId, body.primaryId, body.secondaryId);
  }
}
