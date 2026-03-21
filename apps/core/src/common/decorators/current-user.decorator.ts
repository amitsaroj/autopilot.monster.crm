import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { IRequestContext } from '../interfaces/request-context.interface';
import type { Request } from 'express';

/**
 * @CurrentUser() — extracts IRequestContext from the request.
 * Usage: @CurrentUser() user: IRequestContext
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IRequestContext => {
    const request = ctx.switchToHttp().getRequest<Request & { user: IRequestContext }>();
    return request.user;
  },
);
