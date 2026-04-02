import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import type { AppConfig } from '../../../config/app.config';
import { AuthProvider } from '../entities/user.entity';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    const appCfg = configService.get<AppConfig>('app');
    if (!appCfg) throw new Error('App config missing');

    super({
      clientID: appCfg.facebook.appId,
      clientSecret: appCfg.facebook.appSecret,
      callbackURL: appCfg.facebook.callbackUrl,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatarUrl: photos ? photos[0].value : undefined,
      provider: AuthProvider.FACEBOOK,
      providerId: id,
      accessToken,
    };
    done(null, user);
  }
}
