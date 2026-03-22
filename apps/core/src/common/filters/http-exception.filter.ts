import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ERROR_CODES } from '../constants/error-codes.constants';
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
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string }).message ?? exception.message;

    const body: IApiResponse<null> = {
      success: false,
      error: message,
      code: this.resolveErrorCode(status),
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'] as string | undefined,
    };

    response.status(status).json(body);
  }

  private resolveErrorCode(status: number): string {
    const statusMap: Record<number, string> = {
      401: ERROR_CODES.UNAUTHORIZED,
      403: ERROR_CODES.FORBIDDEN,
      404: ERROR_CODES.NOT_FOUND,
      409: ERROR_CODES.CONFLICT,
      422: ERROR_CODES.VALIDATION_ERROR,
      429: ERROR_CODES.RATE_LIMITED,
      503: ERROR_CODES.SERVICE_UNAVAILABLE,
    };
    return statusMap[status] ?? ERROR_CODES.INTERNAL_ERROR;
  }
}
