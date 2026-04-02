import type { JwtConfig } from '../../config/jwt.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from './entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Role } from '../../database/entities/role.entity';
import { UserRole } from '../../database/entities/user-role.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { MfaService } from './mfa.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get<JwtConfig>('jwt');
        if (jwt === undefined) throw new Error('JWT config missing');
        return { secret: jwt.secret, signOptions: { expiresIn: jwt.expiresIn as any } };
      },
    }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity, RefreshTokenEntity, Tenant, Role, UserRole]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    MfaService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    GithubStrategy,
    AppleStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    GoogleAuthGuard,
    FacebookAuthGuard,
    GithubAuthGuard,
    AppleAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
