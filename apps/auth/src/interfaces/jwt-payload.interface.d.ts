export interface JwtPayload {
    sub: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
    planId: string;
    iat?: number;
    exp?: number;
}
