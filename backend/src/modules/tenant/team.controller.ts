import {
  Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamDto } from './dto/tenant-features.dto';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { Roles, TenantId } from '../../common/decorators';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a team' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateTeamDto) {
    return this.teamService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams' })
  async findAll(@TenantId() tenantId: string) {
    return this.teamService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.teamService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update team' })
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamService.update(tenantId, id, dto);
  }

  @Post(':id/members')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Add members to team' })
  async addMembers(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { memberIds: string[] },
  ) {
    return this.teamService.addMembers(tenantId, id, body.memberIds);
  }

  @Delete(':id/members')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Remove members from team' })
  async removeMembers(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { memberIds: string[] },
  ) {
    return this.teamService.removeMembers(tenantId, id, body.memberIds);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.teamService.remove(tenantId, id);
  }
}
