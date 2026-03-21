import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

/**
 * AppLogger — wrapper around Winston for dependency injection.
 * Implements NestJS LoggerService so it can replace the default logger.
 */
@Injectable()
export class AppLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winston: Logger,
  ) {}

  log(message: string, context?: string): void {
    this.winston.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.winston.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.winston.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.winston.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.winston.verbose(message, { context });
  }
}
