import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';

@Injectable()
export class MfaService {
  generateSecret(): string {
    return generateSecret();
  }

  generateQrCodeUrl(email: string, issuer: string, secret: string): string {
    return generateURI({
      issuer,
      label: email,
      secret,
    });
  }

  verifyToken(token: string, secret: string): boolean {
    const result = verifySync({ token, secret });
    return result.valid;
  }
}
