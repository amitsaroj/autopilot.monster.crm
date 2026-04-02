import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import type { IRequestContext } from '../../common/interfaces/request-context.interface';
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/app.config';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

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
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import type { AuthTokens } from './interfaces/auth-tokens.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and tenant', security: [] })
  @ApiResponse({ status: 201, description: 'User and tenant successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() dto: RegisterDto,
    @TenantId() tenantId: string,
  ): Promise<{ user: any; tenant: any }> {
    return this.authService.register(dto, tenantId);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email + password', security: [] })
  @ApiResponse({ status: 200, description: 'Successfully logged in, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account locked' })
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
  @ApiOperation({ summary: 'Refresh access token', security: [] })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
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
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  async logout(@CurrentUser() user: IRequestContext, @Body() dto: LogoutDto): Promise<void> {
    return this.authService.logout(user.userId, user.tenantId, dto.allSessions ?? false);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 204, description: 'Password successfully changed' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
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
  @ApiResponse({ status: 200, description: 'Returns current user session details' })
  me(@CurrentUser() user: IRequestContext): IRequestContext {
    return user;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link', security: [] })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @TenantId() tenantId: string,
  ): Promise<void> {
    return this.authService.forgotPassword(dto.email, tenantId);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token', security: [] })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email using token', security: [] })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup MFA (generate secret)' })
  @ApiResponse({ status: 200, description: 'Returns MFA secret and QR code URL' })
  async enableMfa(@CurrentUser() user: IRequestContext) {
    return this.authService.generateMfaSecret(user.userId, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and activate MFA with token' })
  @ApiResponse({ status: 200, description: 'MFA successfully activated' })
  @ApiResponse({ status: 401, description: 'Invalid TOTP code' })
  async verifyMfa(@CurrentUser() user: IRequestContext, @Body() dto: EnableMfaDto): Promise<void> {
    return this.authService.enableMfa(user.userId, user.tenantId, dto.totpCode);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('mfa')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiResponse({ status: 200, description: 'MFA successfully disabled' })
  async disableMfa(@CurrentUser() user: IRequestContext): Promise<void> {
    return this.authService.disableMfa(user.userId, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions' })
  @ApiResponse({ status: 200, description: 'Returns list of active user sessions' })
  async getSessions(@CurrentUser() user: IRequestContext) {
    return this.authService.getSessions(user.userId, user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session successfully revoked' })
  async revokeSession(
    @CurrentUser() user: IRequestContext,
    @Param('id') sessionId: string,
  ): Promise<void> {
    return this.authService.revokeSession(user.userId, user.tenantId, sessionId);
  }

  // ─── OAuth ────────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Login with Google' })
  async googleLogin(): Promise<void> {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: any, @Res() res: Response, @Ip() ip: string): Promise<void> {
    const user = await this.authService.validateOAuthUser(req.user);
    const tokens = await this.authService.oauthLogin(user, ip);
    this.redirectWithTokens(res, tokens);
  }

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  @ApiOperation({ summary: 'Login with Facebook' })
  async facebookLogin(): Promise<void> {}

  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookCallback(@Req() req: any, @Res() res: Response, @Ip() ip: string): Promise<void> {
    const user = await this.authService.validateOAuthUser(req.user);
    const tokens = await this.authService.oauthLogin(user, ip);
    this.redirectWithTokens(res, tokens);
  }

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('github')
  @ApiOperation({ summary: 'Login with GitHub' })
  async githubLogin(): Promise<void> {}

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Req() req: any, @Res() res: Response, @Ip() ip: string): Promise<void> {
    const user = await this.authService.validateOAuthUser(req.user);
    const tokens = await this.authService.oauthLogin(user, ip);
    this.redirectWithTokens(res, tokens);
  }

  @Public()
  @UseGuards(AppleAuthGuard)
  @Get('apple')
  @ApiOperation({ summary: 'Login with Apple' })
  async appleLogin(): Promise<void> {}

  @Public()
  @UseGuards(AppleAuthGuard)
  @Post('apple/callback') // Apple callback is usually a POST request
  @ApiOperation({ summary: 'Apple OAuth callback' })
  async appleCallback(@Req() req: any, @Res() res: Response, @Ip() ip: string): Promise<void> {
    const user = await this.authService.validateOAuthUser(req.user);
    const tokens = await this.authService.oauthLogin(user, ip);
    this.redirectWithTokens(res, tokens);
  }

  private redirectWithTokens(res: Response, tokens: AuthTokens): void {
    const appCfg = this.configService.get<AppConfig>('app');
    const frontendUrl = appCfg?.frontendUrl || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
