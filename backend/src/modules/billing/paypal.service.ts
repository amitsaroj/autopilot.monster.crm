import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class PaypalService {
  constructor(private readonly configService: ConfigService) {}

  private assertConfigured(): AppConfig['paypal'] {
    const config = this.configService.get<AppConfig['paypal']>('app.paypal');
    if (!config?.clientId || !config.clientSecret) {
      throw new ServiceUnavailableException(
        'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
      );
    }
    return config;
  }

  async createCheckoutSession(tenantId: string, amount: number, currency: string = 'USD') {
    this.assertConfigured();
    throw new ServiceUnavailableException(
      `PayPal checkout is not implemented yet (tenant ${tenantId}, ${amount} ${currency}).`,
    );
  }

  async verifyWebhookSignature(_payload: unknown, _signature: string) {
    this.assertConfigured();
    throw new ServiceUnavailableException('PayPal webhook verification is not implemented yet.');
  }

  async handleWebhookEvent(_event: unknown) {
    this.assertConfigured();
    throw new ServiceUnavailableException('PayPal webhook handling is not implemented yet.');
  }
}
