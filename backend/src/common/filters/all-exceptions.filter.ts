import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Inject } from '@nestjs/common';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

import type { IApiResponse } from '../interfaces/api-response.interface';

/**
 * AllExceptionsFilter — catch-all filter for unexpected errors.
 * Ensures nothing leaks internal stack traces to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const error = exception instanceof Error ? exception : undefined;
    const correlationId = request.headers['x-correlation-id'];

    this.logger.error('Unhandled exception', {
      correlationId,
      method: request.method,
      path: request.originalUrl ?? request.url,
      error: error?.message ?? String(exception),
      stack: error?.stack,
    });

    const body: IApiResponse<null> = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: true,
      data: null,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
