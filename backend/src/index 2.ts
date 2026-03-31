// Auth module public API
export { AuthModule } from './auth.module';
export { AuthService } from './auth.service';
export { UserEntity } from './entities/user.entity';
export { SessionEntity } from './entities/session.entity';
export { RefreshTokenEntity } from './entities/refresh-token.entity';
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { LocalAuthGuard } from './guards/local-auth.guard';
export type { JwtPayload } from './interfaces/jwt-payload.interface';
export type { AuthTokens } from './interfaces/auth-tokens.interface';
export type { IAuthUser } from './interfaces/auth-user.interface';
