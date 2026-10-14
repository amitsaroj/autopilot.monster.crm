import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PlanFeature, ResourcePermissions, TenantId } from '../../common/decorators';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { ConnectWhatsappAccountDto } from './dto/whatsapp-account.dto';
import { WhatsappAccountService } from './whatsapp-account.service';

@ApiTags('WhatsApp accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('whatsapp')
@PlanFeature('whatsapp')
@Controller('whatsapp/accounts')
export class WhatsappAccountController {
  constructor(private readonly accounts: WhatsappAccountService) {}

  @Get()
  @ApiOperation({ summary: 'List tenant WhatsApp accounts and provider capabilities' })
  list(@TenantId() tenantId: string) {
    return this.accounts.list(tenantId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Validate Meta phone/WABA access and connect a tenant account' })
  connect(
    @TenantId() tenantId: string,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false, value: false },
      }),
    )
    dto: ConnectWhatsappAccountDto,
  ) {
    return this.accounts.connect(tenantId, dto);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Read account health from Meta without sending messages' })
  health(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.accounts.health(tenantId, id);
  }

  @Post(':id/disconnect')
  @ApiOperation({ summary: 'Erase local credentials, retaining provider phone ownership' })
  disconnect(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.accounts.disconnect(tenantId, id);
  }
}
