import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class RazorpayService {
  constructor(private readonly configService: ConfigService) {}

  private assertConfigured(): AppConfig['razorpay'] {
    const config = this.configService.get<AppConfig['razorpay']>('app.razorpay');
    if (!config?.keyId || !config.keySecret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }
    return config;
  }

  async createOrder(tenantId: string, amount: number, currency: string = 'INR') {
    this.assertConfigured();
    throw new ServiceUnavailableException(
      `Razorpay order creation is not implemented yet (tenant ${tenantId}, ${amount} ${currency}).`,
    );
  }

  async verifyPaymentSignature(orderId: string, _paymentId: string, _signature: string) {
    this.assertConfigured();
    throw new ServiceUnavailableException(
      `Razorpay signature verification is not implemented yet (order ${orderId}).`,
    );
  }

  async handleWebhookEvent(_event: unknown, _signature: string) {
    this.assertConfigured();
    throw new ServiceUnavailableException('Razorpay webhook handling is not implemented yet.');
  }
}
