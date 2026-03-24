import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { IApiResponse } from '../interfaces/api-response.interface';

/**
 * TransformInterceptor — wraps every successful response in IApiResponse envelope.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        return {
          status: response.statusCode,
          message: 'Operation successful',
          error: false,
          data,
        };
      }),
    );
  }
}
