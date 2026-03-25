import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminInvoicesService } from './admin-invoices.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Invoices')
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
    const data = await this.adminInvoicesService.findAll({ tenantId, status });
    return {
      status: 200,
      message: 'Invoices retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminInvoicesService.findOne(id);
    return {
      status: 200,
      message: 'Invoice retrieved',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice status' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminInvoicesService.update(id, body);
    return {
      status: 200,
      message: 'Invoice updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async remove(@Param('id') id: string) {
    await this.adminInvoicesService.remove(id);
    return {
      status: 200,
      message: 'Invoice deleted',
      error: false,
      data: null,
    };
  }
}
