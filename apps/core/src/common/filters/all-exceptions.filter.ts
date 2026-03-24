import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

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

    const body: IApiResponse<null> = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: true,
      data: null,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
