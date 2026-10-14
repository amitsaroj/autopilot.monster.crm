import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourcePermissions, TenantId } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import {
  InstallWhatsappAutomationDto,
  PreviewWhatsappAutomationDto,
  RunWhatsappAutomationDto,
} from './whatsapp-automation.dto';
import { WhatsappAutomationService } from './whatsapp-automation.service';

const configValidation = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  validationError: { target: false, value: false },
});

@ApiTags('WhatsApp automation products')
@ApiBearerAuth()
@ResourcePermissions('marketplace')
@Controller('whatsapp-automations')
export class WhatsappAutomationController {
  constructor(private readonly automations: WhatsappAutomationService) {}

  @Get('catalog')
  @Public()
  @ApiOperation({ summary: 'Public catalog with truthful product pricing and requirements' })
  catalog(@Query('category') category?: string, @Query('search') search?: string) {
    return this.automations.catalog(category, search);
  }

  @Get('catalog/:slug')
  @Public()
  detail(@Param('slug') slug: string) {
    return this.automations.detail(slug);
  }

  @Get('coverage')
  @Public()
  coverage() {
    return this.automations.coverage();
  }

  @Get('installed')
  installed(@TenantId() tenantId: string) {
    return this.automations.installed(tenantId);
  }

  @Post('catalog/:slug/install')
  install(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Body(configValidation) dto: InstallWhatsappAutomationDto,
  ) {
    return this.automations.install(tenantId, slug, dto.config);
  }

  @Post('catalog/:slug/checkout')
  checkout(@TenantId() tenantId: string, @Param('slug') slug: string) {
    return this.automations.checkout(tenantId, slug);
  }

  @Post('catalog/:slug/preview')
  @ApiOperation({
    summary: 'Validate configuration and preview resolved steps without executing actions',
  })
  preview(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Body(configValidation) dto: PreviewWhatsappAutomationDto,
  ) {
    return this.automations.preview(tenantId, slug, dto.config, dto.payload);
  }

  @Get('installed/:id/executions')
  executions(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.automations.executions(tenantId, id);
  }

  @Post('installed/:id/run')
  @ApiOperation({ summary: 'Trigger an active manual automation with a retry-safe request UUID' })
  run(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(configValidation) dto: RunWhatsappAutomationDto,
  ) {
    return this.automations.run(tenantId, id, dto.payload, dto.requestId);
  }

  @Patch('installed/:id/config')
  configure(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(configValidation) dto: InstallWhatsappAutomationDto,
  ) {
    return this.automations.configure(tenantId, id, dto.config);
  }

  @Post('installed/:id/activate')
  activate(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.automations.activate(tenantId, id);
  }

  @Post('installed/:id/disable')
  disable(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.automations.disable(tenantId, id);
  }

  @Delete('installed/:id')
  uninstall(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.automations.disable(tenantId, id, true);
  }
}
