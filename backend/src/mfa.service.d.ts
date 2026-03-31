export declare class MfaService {
    generateSecret(): string;
    generateQrCodeUrl(email: string, issuer: string, secret: string): string;
    verifyToken(token: string, secret: string): boolean;
}
