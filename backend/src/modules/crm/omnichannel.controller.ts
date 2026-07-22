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
    const data = await this.omnichannelService.sendUnifiedMessage(
      tenantId,
      dto.contactId,
      dto.text,
      dto.preferredChannel,
    );
    return { status: 201, message: 'Message sent', error: false, data };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get unified conversations across all channels' })
  async getConversations(@TenantId() tenantId: string) {
    const data = await this.omnichannelService.getConversations(tenantId);
    return { status: 200, message: 'Conversations retrieved', error: false, data };
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get unified messages for a conversation' })
  async getMessages(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.omnichannelService.getMessages(tenantId, id);
    return { status: 200, message: 'Messages retrieved', error: false, data };
  }

  @Post('conversations/:id/route')
  @ApiOperation({ summary: 'Route conversation to the best agent' })
  async routeConversation(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.omnichannelService.routeToAgent(tenantId, id);
    return { status: 200, message: 'Conversation routed', error: false, data };
  }
}
