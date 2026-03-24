import { CurrentUser } from '@autopilot/core/common/decorators/current-user.decorator';
import { Public } from '@autopilot/core/common/decorators/public.decorator';
import { TenantId } from '@autopilot/core/common/decorators/tenant-id.decorator';
import type { IRequestContext } from '@autopilot/core/common/interfaces/request-context.interface';
import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Ip, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  EnableMfaDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthTokens } from './interfaces/auth-tokens.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @TenantId() tenantId: string,
  ): Promise<{ userId: string }> {
    return this.authService.register(dto, tenantId);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email + password' })
  async login(
    @Body() dto: LoginDto,
    @TenantId() tenantId: string,
    @Ip() ip: string,
  ): Promise<AuthTokens> {
    return this.authService.login(dto, tenantId, ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @TenantId() tenantId: string,
    @Ip() ip: string,
  ): Promise<AuthTokens> {
    return this.authService.refreshTokens(dto.refreshToken, tenantId, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  async logout(@CurrentUser() user: IRequestContext, @Body() dto: LogoutDto): Promise<void> {
    return this.authService.logout(user.userId, user.tenantId, dto.allSessions ?? false);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser() user: IRequestContext,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(
      user.userId,
      user.tenantId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user context' })
  me(@CurrentUser() user: IRequestContext): IRequestContext {
    return user;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @TenantId() tenantId: string): Promise<void> {
    return this.authService.forgotPassword(dto.email, tenantId);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email using token' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup MFA (generate secret)' })
  async setupMfa(@CurrentUser() user: IRequestContext) {
    return this.authService.generateMfaSecret(user.userId, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA with token' })
  async enableMfa(@CurrentUser() user: IRequestContext, @Body() dto: EnableMfaDto): Promise<void> {
    return this.authService.enableMfa(user.userId, user.tenantId, dto.totpCode);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('mfa')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA' })
  async disableMfa(@CurrentUser() user: IRequestContext): Promise<void> {
    return this.authService.disableMfa(user.userId, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions' })
  async getSessions(@CurrentUser() user: IRequestContext) {
    return this.authService.getSessions(user.userId, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(@CurrentUser() user: IRequestContext, @Param('id') sessionId: string): Promise<void> {
    return this.authService.revokeSession(user.userId, user.tenantId, sessionId);
  }
}
