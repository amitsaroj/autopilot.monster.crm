import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { AppConfig } from '../../../config/app.config';
import { AuthProvider } from '../entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const appCfg = configService.get<AppConfig>('app');
    if (!appCfg) throw new Error('App config missing');

    super({
      clientID: appCfg.google.clientId,
      clientSecret: appCfg.google.clientSecret,
      callbackURL: appCfg.google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatarUrl: photos[0].value,
      provider: AuthProvider.GOOGLE,
      providerId: id,
      accessToken,
    };
    done(null, user);
  }
}
