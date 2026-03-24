import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import type { Response } from 'express';

import type { IApiResponse } from '../interfaces/api-response.interface';

/**
 * HttpExceptionFilter — catches NestJS HttpException and returns
 * a standardised IApiResponse envelope.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: string }).message ?? exception.message);

    const body: IApiResponse<null> = {
      status,
      message,
      error: true,
      data: null,
    };

    response.status(status).json(body);
  }
}
