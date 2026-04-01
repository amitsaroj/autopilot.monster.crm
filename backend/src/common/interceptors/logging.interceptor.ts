import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import type { Request, Response } from 'express';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Logger } from 'winston';

/**
 * LoggingInterceptor — logs every inbound request and outbound response timing.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const start = Date.now();

    this.logger.info('Incoming request', {
      method: request.method,
      url: request.url,
      correlationId: request.headers['x-correlation-id'],
      userId: (request as any).user?.userId || (request as any).user?.id,
      tenantId: (request as any).user?.tenantId || request.headers['x-tenant-id'],
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.info('Request completed', {
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          durationMs: Date.now() - start,
          userId: (request as any).user?.userId || (request as any).user?.id,
          tenantId: (request as any).user?.tenantId || request.headers['x-tenant-id'],
        });
      }),
    );
  }
}
