import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminInvoicesService } from './admin-invoices.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Invoices')
@ResourcePermissions('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/invoices')
export class AdminInvoicesController {
  constructor(private readonly adminInvoicesService: AdminInvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('tenantId') tenantId?: string, @Query('status') status?: string) {
    return await this.adminInvoicesService.findAll({ tenantId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  async findOne(@Param('id') id: string) {
    return await this.adminInvoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice status' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.adminInvoicesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async remove(@Param('id') id: string) {
    await this.adminInvoicesService.remove(id);
    return null;
  }
}
