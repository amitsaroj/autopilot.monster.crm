import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminTenantsService } from './admin-tenants.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/tenants')
export class AdminTenantsController {
  constructor(private readonly adminTenantsService: AdminTenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query('search') search?: string) {
    const data = await this.adminTenantsService.findAll({ search });
    return {
      status: 200,
      message: 'Tenants retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant details' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminTenantsService.findOne(id);
    return {
      status: 200,
      message: 'Tenant retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (workspace)' })
  async create(@Body() body: any) {
    const data = await this.adminTenantsService.create(body);
    return {
      status: 201,
      message: 'Tenant created',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant details/status' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminTenantsService.update(id, body);
    return {
      status: 200,
      message: 'Tenant updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  async remove(@Param('id') id: string) {
    await this.adminTenantsService.remove(id);
    return {
      status: 200,
      message: 'Tenant deleted',
      error: false,
      data: null,
    };
  }
}
