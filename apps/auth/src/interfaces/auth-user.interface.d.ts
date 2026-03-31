export interface IAuthUser {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
    planId: string;
    isActive: boolean;
    isMfaEnabled: boolean;
}
