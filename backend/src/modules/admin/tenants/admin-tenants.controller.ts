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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminTenantsService } from './admin-tenants.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';
import { CreateTenantDto } from '../../tenant/dto/create-tenant.dto';
import { TenantFilterDto } from '../../tenant/dto/tenant.dto';

@ApiTags('Admin / Tenants')
@ResourcePermissions('tenant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/tenants')
export class AdminTenantsController {
  constructor(private readonly adminTenantsService: AdminTenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  async findAll(@Query() filter: TenantFilterDto) {
    return this.adminTenantsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant details' })
  async findOne(@Param('id') id: string) {
    return this.adminTenantsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (workspace)' })
  async create(@Body() body: CreateTenantDto) {
    return this.adminTenantsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant details/status' })
  async update(@Param('id') id: string, @Body() body: Partial<CreateTenantDto>) {
    return this.adminTenantsService.update(id, body);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend tenant' })
  async suspend(@Param('id') id: string) {
    return this.adminTenantsService.suspend(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate tenant' })
  async activate(@Param('id') id: string) {
    return this.adminTenantsService.activate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete tenant' })
  async remove(@Param('id') id: string) {
    await this.adminTenantsService.remove(id);
  }
}
