import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import type { SignOptions } from 'jsonwebtoken';
import { WEBHOOK_QUEUE, WebhookService } from './webhook.service';
import { WebhookDeliveryProcessor } from './webhook-delivery.processor';
import { WebhookEventListener } from './webhook-event.listener';
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
    BullModule.registerQueue({ name: WEBHOOK_QUEUE }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get<JwtConfig>('jwt');
        if (jwt === undefined) throw new Error('JWT config missing');
        return {
          secret: jwt.secret,
          signOptions: { expiresIn: jwt.expiresIn as SignOptions['expiresIn'] },
        };
      },
    }),
    TypeOrmModule.forFeature([Webhook, WebhookDelivery, OAuthApp, OAuthCode, ApiLog]),
  ],
  controllers: [WebhookController, OAuthController, ApiLogController],
  providers: [
    WebhookService,
    WebhookDeliveryProcessor,
    WebhookEventListener,
    OAuthService,
    ApiLogService,
  ],
  exports: [WebhookService, OAuthService, ApiLogService],
})
export class DeveloperModule {}
