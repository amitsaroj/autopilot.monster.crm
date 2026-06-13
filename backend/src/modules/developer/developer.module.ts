import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { ApiLogService } from './api-log.service';
import { ApiLogController } from './api-log.controller';
import { Webhook } from '../../database/entities/webhook.entity';
import { WebhookDelivery } from '../../database/entities/webhook-delivery.entity';
import { OAuthApp } from '../../database/entities/oauth-app.entity';
import { OAuthCode } from '../../database/entities/oauth-code.entity';
import { ApiLog } from '../../database/entities/api-log.entity';
import type { JwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get<JwtConfig>('jwt');
        if (jwt === undefined) throw new Error('JWT config missing');
        return { secret: jwt.secret, signOptions: { expiresIn: jwt.expiresIn as any } };
      },
    }),
    TypeOrmModule.forFeature([Webhook, WebhookDelivery, OAuthApp, OAuthCode, ApiLog]),
  ],
  controllers: [WebhookController, OAuthController, ApiLogController],
  providers: [WebhookService, OAuthService, ApiLogService],
  exports: [WebhookService, OAuthService, ApiLogService],
})
export class DeveloperModule {}
