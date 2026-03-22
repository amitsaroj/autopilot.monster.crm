import { CurrentUser } from '@autopilot/core/common/decorators/current-user.decorator';
import { Public } from '@autopilot/core/common/decorators/public.decorator';
import { TenantId } from '@autopilot/core/common/decorators/tenant-id.decorator';
import type { IRequestContext } from '@autopilot/core/common/interfaces/request-context.interface';
import {
  Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, LogoutDto } from './dto/auth.dto';
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
  async register(@Body() dto: RegisterDto, @TenantId() tenantId: string): Promise<{ userId: string }> {
    return this.authService.register(dto, tenantId);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email + password' })
  async login(@Body() dto: LoginDto, @TenantId() tenantId: string, @Ip() ip: string): Promise<AuthTokens> {
    return this.authService.login(dto, tenantId, ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto, @TenantId() tenantId: string, @Ip() ip: string): Promise<AuthTokens> {
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
  async changePassword(@CurrentUser() user: IRequestContext, @Body() dto: ChangePasswordDto): Promise<void> {
    return this.authService.changePassword(user.userId, user.tenantId, dto.currentPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user context' })
  me(@CurrentUser() user: IRequestContext): IRequestContext {
    return user;
  }
}
