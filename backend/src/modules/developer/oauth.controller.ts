import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OAuthService } from './oauth.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Developer - OAuth')
@Controller('developer/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('apps')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Register a new OAuth Application' })
  async createApp(@TenantId() tenantId: string, @Body() dto: any) {
    return this.oauthService.createApp(tenantId, dto);
  }

  @Get('apps')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'List all registered OAuth Applications' })
  async getApps(@TenantId() tenantId: string) {
    return this.oauthService.getApps(tenantId);
  }

  @Get('apps/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get details of an OAuth Application' })
  async getAppById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.oauthService.getAppById(tenantId, id);
  }

  @Delete('apps/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an OAuth Application' })
  async deleteApp(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.oauthService.deleteApp(tenantId, id);
  }

  @Get('authorize-details')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Validate client authorization parameters and get app details' })
  async getAuthorizeDetails(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
  ) {
    return this.oauthService.validateClientRedirect(clientId, redirectUri);
  }

  @Post('authorize')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Authorize a client and generate OAuth authorization code' })
  async authorize(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() dto: { client_id: string; redirect_uri: string; scopes: string[] },
  ) {
    const userId = req.user.userId;
    const code = await this.oauthService.createAuthCode(
      dto.client_id,
      tenantId,
      userId,
      dto.redirect_uri,
      dto.scopes || ['*'],
    );
    return { code };
  }

  @Post('token')
  @Public()
  @ApiOperation({ summary: 'Exchange authorization code for an Access Token' })
  async token(
    @Body() dto: { client_id: string; client_secret: string; code: string; redirect_uri: string },
  ) {
    return this.oauthService.exchangeCodeForToken(
      dto.client_id,
      dto.client_secret,
      dto.code,
      dto.redirect_uri,
    );
  }
}
