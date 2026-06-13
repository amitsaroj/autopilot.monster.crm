import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthApp } from '../../database/entities/oauth-app.entity';
import { OAuthCode } from '../../database/entities/oauth-code.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtConfig } from '../../config/jwt.config';
import * as crypto from 'crypto';

@Injectable()
export class OAuthService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    @InjectRepository(OAuthApp)
    private readonly appRepo: Repository<OAuthApp>,
    @InjectRepository(OAuthCode)
    private readonly codeRepo: Repository<OAuthCode>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const cfg = this.configService.get<JwtConfig>('jwt');
    if (!cfg) throw new Error('JWT configuration missing');
    this.jwtConfig = cfg;
  }

  async createApp(tenantId: string, dto: { name: string; description?: string; redirectUris: string[]; scopes: string[] }): Promise<OAuthApp> {
    const clientId = 'client_' + crypto.randomBytes(16).toString('hex');
    const clientSecret = 'secret_' + crypto.randomBytes(32).toString('hex');
    const app = this.appRepo.create({
      ...dto,
      tenantId,
      clientId,
      clientSecret,
      isActive: true,
    } as any) as unknown as OAuthApp;
    return this.appRepo.save(app) as unknown as Promise<OAuthApp>;
  }

  async getApps(tenantId: string): Promise<OAuthApp[]> {
    return this.appRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async getAppById(tenantId: string, id: string): Promise<OAuthApp> {
    const app = await this.appRepo.findOne({ where: { id, tenantId } as any });
    if (!app) throw new NotFoundException('OAuth application not found');
    return app;
  }

  async deleteApp(tenantId: string, id: string): Promise<void> {
    const app = await this.getAppById(tenantId, id);
    await this.appRepo.softRemove(app);
  }

  async validateClientRedirect(clientId: string, redirectUri: string): Promise<OAuthApp> {
    const app = await this.appRepo.findOne({ where: { clientId, isActive: true } as any });
    if (!app) throw new BadRequestException('Invalid Client ID');
    
    // Exact match redirect URI
    if (!app.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('Redirect URI mismatch');
    }
    return app;
  }

  async createAuthCode(clientId: string, tenantId: string, userId: string, redirectUri: string, scopes: string[]): Promise<string> {
    await this.validateClientRedirect(clientId, redirectUri);
    
    const code = 'code_' + crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    const codeRecord = this.codeRepo.create({
      code,
      clientId,
      tenantId,
      userId,
      redirectUri,
      scopes,
      expiresAt,
    } as any) as unknown as OAuthCode;

    await this.codeRepo.save(codeRecord);
    return code;
  }

  async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<any> {
    const app = await this.appRepo.findOne({ where: { clientId, clientSecret, isActive: true } as any });
    if (!app) throw new UnauthorizedException('Invalid client credentials');

    const codeRecord = await this.codeRepo.findOne({ where: { code } as any });
    if (!codeRecord) throw new BadRequestException('Invalid or expired authorization code');

    // Code reuse protection, expire validation
    await this.codeRepo.delete({ code });

    if (codeRecord.clientId !== clientId) {
      throw new BadRequestException('Client ID mismatch');
    }

    if (codeRecord.redirectUri !== redirectUri) {
      throw new BadRequestException('Redirect URI mismatch');
    }

    if (codeRecord.expiresAt < new Date()) {
      throw new BadRequestException('Authorization code expired');
    }

    // Sign OAuth JWT Access Token
    const payload = {
      sub: codeRecord.userId,
      tenantId: codeRecord.tenantId,
      clientId: codeRecord.clientId,
      scopes: codeRecord.scopes,
      roles: ['user'], // standard role for API access
      permissions: codeRecord.scopes.includes('*') ? ['*'] : codeRecord.scopes,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.secret,
      expiresIn: '1h',
      issuer: 'autopilot.monster',
      audience: 'autopilot.monster.user',
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: codeRecord.scopes.join(' '),
    };
  }
}
