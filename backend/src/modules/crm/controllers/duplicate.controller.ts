import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DuplicateDetectionService } from '../duplicate-detection.service';
import { JwtAuthGuard, TenantGuard } from '../../../common/guards';
import {
  TenantId,
  Roles,
  ResourcePermissions,
  PlanFeature,
  CurrentUser,
} from '../../../common/decorators';
import { IRequestContext } from '../../../common/interfaces/request-context.interface';
import { CheckDuplicateDto, MergeRecordsDto } from '../dto/crm.dto';

@ApiTags('CRM - Duplicate Detection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('crm')
@PlanFeature('crm')
@Controller('crm/duplicates')
export class DuplicateController {
  constructor(private readonly dupeService: DuplicateDetectionService) {}

  @Get()
  @ApiOperation({ summary: 'Scan for duplicate contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async findDuplicates(@TenantId() tenantId: string) {
    const data = await this.dupeService.findDuplicates(tenantId);
    return { status: 200, message: 'Duplicates retrieved', error: false, data };
  }

  @Get('companies')
  @ApiOperation({ summary: 'Scan for duplicate companies' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async findCompanyDuplicates(@TenantId() tenantId: string) {
    const data = await this.dupeService.findCompanyDuplicates(tenantId);
    return { status: 200, message: 'Company duplicates retrieved', error: false, data };
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if a contact is a potential duplicate' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async checkDuplicate(@TenantId() tenantId: string, @Body() data: CheckDuplicateDto) {
    const matches = await this.dupeService.checkForDuplicate(tenantId, data);
    return { status: 200, message: 'Duplicate check complete', error: false, data: matches };
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge two duplicate contacts' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async merge(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() body: MergeRecordsDto,
  ) {
    const data = await this.dupeService.mergeContacts(
      tenantId,
      body.primaryId,
      body.secondaryId,
      actor.userId,
    );
    return { status: 200, message: 'Contacts merged', error: false, data };
  }

  @Post('companies/merge')
  @ApiOperation({ summary: 'Merge two duplicate companies' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async mergeCompanies(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() body: MergeRecordsDto,
  ) {
    const data = await this.dupeService.mergeCompanies(
      tenantId,
      body.primaryId,
      body.secondaryId,
      actor.userId,
    );
    return { status: 200, message: 'Companies merged', error: false, data };
  }
}
