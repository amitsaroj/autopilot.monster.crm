import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import type { AppConfig } from '../../../config/app.config';
import { AuthProvider } from '../entities/user.entity';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(configService: ConfigService) {
    const appCfg = configService.get<AppConfig>('app');
    if (!appCfg) throw new Error('App config missing');

    super({
      clientID: appCfg.apple.clientId,
      teamID: appCfg.apple.teamId,
      keyID: appCfg.apple.keyId,
      privateKeyString: appCfg.apple.privateKey,
      callbackURL: appCfg.apple.callbackUrl,
      passReqToCallback: false,
      scope: ['name', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    idToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    // Apple only sends profile once upon first login.
    // In subsequent logins, it might be undefined.
    // The ID token contains the email.
    const user = {
      email: profile?.email || '', // In production, decode idToken for email
      firstName: profile?.name?.firstName || 'Apple',
      lastName: profile?.name?.lastName || 'User',
      provider: AuthProvider.APPLE,
      providerId: profile?.user || '', // User ID from profile
      idToken,
    };
    done(null, user);
  }
}
