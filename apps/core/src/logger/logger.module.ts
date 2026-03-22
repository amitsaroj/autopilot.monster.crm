import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppLogger } from './logger.service';
import type { AppConfig } from '../config/app.config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const app = configService.get<AppConfig>('app');
        const level = app?.logLevel ?? 'debug';
        const format = app?.logFormat === 'json'
          ? winston.format.json()
          : winston.format.simple();

        return {
          transports: [
            new winston.transports.Console({
              level,
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                format,
              ),
            }),
          ],
        };
      },
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger, WinstonModule],
})
export class LoggerModule {}
