/**
 * JWT Payload — data encoded into the JWT access token.
 * tenantId + planId are critical for runtime guard checks.
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  planId: string;
  iat?: number;
  exp?: number;
}
