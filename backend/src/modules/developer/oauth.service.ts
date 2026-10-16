import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthApp } from '../../database/entities/oauth-app.entity';
import { OAuthCode } from '../../database/entities/oauth-code.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtConfig } from '../../config/jwt.config';
import * as crypto from 'crypto';

/** OAuthApp without any secret material — the only shape ever returned to callers. */
export type PublicOAuthApp = Omit<OAuthApp, 'clientSecret' | 'clientSecretHash'>;

/** What the consent screen needs; deliberately excludes tenant/secret fields. */
export interface OAuthAuthorizeDetails {
  clientId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  scopes: string[];
  redirectUri: string;
  redirectUriValid: true;
}

const sha256 = (value: string): Buffer => crypto.createHash('sha256').update(value).digest();

function toPublicApp(app: OAuthApp): PublicOAuthApp {
  const { clientSecret: _secret, clientSecretHash: _hash, ...rest } = app;
  return rest;
}

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

  async createApp(
    tenantId: string,
    dto: { name: string; description?: string; redirectUris: string[]; scopes: string[] },
  ): Promise<PublicOAuthApp & { clientSecret: string }> {
    const clientId = 'client_' + crypto.randomBytes(16).toString('hex');
    const clientSecret = 'secret_' + crypto.randomBytes(32).toString('hex');
    // Only the hash is stored; the raw secret is returned once, here.
    const app = this.appRepo.create({
      name: dto.name,
      description: dto.description,
      redirectUris: dto.redirectUris,
      scopes: dto.scopes,
      tenantId,
      clientId,
      clientSecretHash: sha256(clientSecret).toString('hex'),
      clientSecretPrefix: clientSecret.slice(0, 12),
      isActive: true,
    });
    const saved = await this.appRepo.save(app);
    return { ...toPublicApp(saved), clientSecret };
  }

  async getApps(tenantId: string): Promise<PublicOAuthApp[]> {
    const apps = await this.appRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
    return apps.map(toPublicApp);
  }

  async getAppById(tenantId: string, id: string): Promise<PublicOAuthApp> {
    return toPublicApp(await this.findApp(tenantId, id));
  }

  private async findApp(tenantId: string, id: string): Promise<OAuthApp> {
    const app = await this.appRepo.findOne({ where: { id, tenantId } });
    if (!app) throw new NotFoundException('OAuth application not found');
    return app;
  }

  async deleteApp(tenantId: string, id: string): Promise<void> {
    const app = await this.findApp(tenantId, id);
    await this.appRepo.softRemove(app);
  }

  private async findActiveAppForRedirect(clientId: string, redirectUri: string): Promise<OAuthApp> {
    const app = await this.appRepo.findOne({ where: { clientId, isActive: true } });
    if (!app) throw new BadRequestException('Invalid Client ID');

    // Exact match redirect URI
    if (!app.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('Redirect URI mismatch');
    }
    return app;
  }

  /** Consent-screen lookup: public fields only, never secrets or owning tenant. */
  async validateClientRedirect(
    clientId: string,
    redirectUri: string,
  ): Promise<OAuthAuthorizeDetails> {
    const app = await this.findActiveAppForRedirect(clientId, redirectUri);
    return {
      clientId: app.clientId,
      name: app.name,
      description: app.description,
      logoUrl: app.logoUrl,
      scopes: app.scopes,
      redirectUri,
      redirectUriValid: true,
    };
  }

  /** Constant-time secret check; supports hashed (current) and plaintext (legacy) rows. */
  private secretMatches(app: OAuthApp, provided: string): boolean {
    const providedHash = sha256(provided);
    if (app.clientSecretHash) {
      const stored = Buffer.from(app.clientSecretHash, 'hex');
      return stored.length === providedHash.length && crypto.timingSafeEqual(stored, providedHash);
    }
    if (app.clientSecret) {
      // ponytail: legacy plaintext rows; backfill client_secret_hash and drop client_secret.
      return crypto.timingSafeEqual(sha256(app.clientSecret), providedHash);
    }
    return false;
  }

  async createAuthCode(
    clientId: string,
    tenantId: string,
    userId: string,
    redirectUri: string,
    scopes: string[],
  ): Promise<string> {
    const app = await this.findActiveAppForRedirect(clientId, redirectUri);
    if (!app.scopes.includes('*') && scopes.some((scope) => !app.scopes.includes(scope))) {
      throw new ForbiddenException('Requested scopes exceed those registered for this client');
    }

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

  async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
  ): Promise<any> {
    const app = await this.appRepo.findOne({ where: { clientId, isActive: true } });
    if (!app || !this.secretMatches(app, clientSecret)) {
      throw new UnauthorizedException('Invalid client credentials');
    }

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
      issuer: 'autopilots.monster',
      audience: 'autopilots.monster.user',
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: codeRecord.scopes.join(' '),
    };
  }
}
