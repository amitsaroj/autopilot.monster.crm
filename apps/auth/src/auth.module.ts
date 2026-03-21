import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { JwtConfig } from '@autopilot/core/config/jwt.config';

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
        return { secret: jwt.secret, signOptions: { expiresIn: jwt.expiresIn } };
      },
    }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity, RefreshTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, LocalStrategy, JwtAuthGuard, LocalAuthGuard],
  exports: [AuthService, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
