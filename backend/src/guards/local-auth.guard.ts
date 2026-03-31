import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * LocalAuthGuard — triggers passport-local strategy for login endpoint.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
