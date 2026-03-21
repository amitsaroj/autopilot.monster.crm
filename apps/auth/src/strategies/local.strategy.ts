import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import type { UserEntity } from '../entities/user.entity';
import { ERROR_CODES } from '@autopilot/core/common/constants/error-codes.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserEntity> {
    const user = await this.authService.validateCredentials(email, password);
    if (user === null) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }
    return user;
  }
}
