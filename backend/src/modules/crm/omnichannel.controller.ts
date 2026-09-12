import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OmnichannelService } from './omnichannel.service';
import { SendOmnichannelMessageDto } from './dto/omnichannel.dto';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';

@ApiTags('Omnichannel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('omnichannel')
@PlanFeature('omnichannel')
@Controller('omnichannel')
export class OmnichannelController {
  constructor(private readonly omnichannelService: OmnichannelService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message through the preferred or fallback channel' })
  async sendMessage(@TenantId() tenantId: string, @Body() dto: SendOmnichannelMessageDto) {
    return await this.omnichannelService.sendUnifiedMessage(
      tenantId,
      dto.contactId,
      dto.text,
      dto.preferredChannel,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get unified conversations across all channels' })
  async getConversations(@TenantId() tenantId: string) {
    return await this.omnichannelService.getConversations(tenantId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get unified messages for a conversation' })
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.omnichannelService.getMessages(tenantId, id);
  }

  @Post('conversations/:id/route')
  @ApiOperation({ summary: 'Route conversation to the best agent' })
  async routeConversation(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.omnichannelService.routeToAgent(tenantId, id);
  }
}
