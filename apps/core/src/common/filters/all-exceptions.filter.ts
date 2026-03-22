import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ERROR_CODES } from '../constants/error-codes.constants';
import type { IApiResponse } from '../interfaces/api-response.interface';

/**
 * AllExceptionsFilter — catch-all filter for unexpected errors.
 * Ensures nothing leaks internal stack traces to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(_exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body: IApiResponse<null> = {
      success: false,
      error: 'An unexpected error occurred',
      code: ERROR_CODES.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'] as string | undefined,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
