import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  async createOrder(tenantId: string, amount: number, currency: string = 'INR') {
    this.logger.log(`[STUB] Razorpay order created for tenant ${tenantId}, amount: ${amount} ${currency}`);
    return { id: 'order_stub_123', amount, currency, status: 'created' };
  }

  async verifyPaymentSignature(orderId: string, _paymentId: string, _signature: string) {
    this.logger.log(`[STUB] Verifying Razorpay payment signature for order ${orderId}`);
    return true;
  }

  async handleWebhookEvent(event: any, _signature: string) {
    this.logger.log(`[STUB] Handling Razorpay webhook event: ${event?.event}`);
    // Handle payment.captured, subscription.charged, etc.
  }
}
