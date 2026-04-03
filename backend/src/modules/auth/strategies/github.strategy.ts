import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import type { AppConfig } from '../../../config/app.config';
import { AuthProvider } from '../entities/user.entity';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    const appCfg = configService.get<AppConfig>('app');
    if (!appCfg) throw new Error('App config missing');

    super({
      clientID: appCfg.github.clientId,
      clientSecret: appCfg.github.clientSecret,
      callbackURL: appCfg.github.callbackUrl,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { username, emails, photos, id, displayName } = profile;
    const nameParts = displayName ? displayName.split(' ') : [username, ''];
    const user = {
      email: emails[0].value,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || '',
      avatarUrl: photos ? photos[0].value : undefined,
      provider: AuthProvider.GITHUB,
      providerId: id,
      accessToken,
    };
    done(null, user);
  }
}
