import crypto from 'crypto';

export interface ImbCreateOrderResponse {
  orderId: string;
  paymentUrl: string;
  status: string;
}

export interface ImbWebhookPayload {
  orderId: string;
  paymentId?: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  transactionId?: string;
  timestamp: string;
}

export class ImbPaymentService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly merchantId: string;
  private readonly callbackUrl: string;
  private readonly webhookSecret: string;

  constructor() {
    this.baseUrl = process.env.IMB_BASE_URL || 'https://api.imbpayment.com/v1';
    this.apiKey = process.env.IMB_API_KEY || '';
    this.merchantId = process.env.IMB_MERCHANT_ID || '';
    this.callbackUrl = process.env.IMB_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/imb/callback`;
    this.webhookSecret = process.env.IMB_WEBHOOK_SECRET || '';
  }

  async createOrder(params: {
    amount: number;
    userId: string;
    userName: string;
    userMobile: string;
    userEmail?: string;
    description?: string;
  }): Promise<ImbCreateOrderResponse> {
    if (!this.apiKey || !this.merchantId) {
      throw new Error('IMB payment gateway is not configured');
    }

    const orderId = this.generateOrderId(params.userId);

    const payload = {
      merchant_id: this.merchantId,
      order_id: orderId,
      amount: Math.round(params.amount * 100), // Convert to paise
      currency: 'INR',
      customer: {
        name: params.userName,
        mobile: params.userMobile,
        email: params.userEmail || '',
      },
      description: params.description || `Deposit for user ${params.userMobile}`,
      callback_url: this.callbackUrl,
      payment_method: 'imps',
    };

    try {
      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Merchant-Id': this.merchantId,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok || !data.payment_url || !data.order_id) {
        throw new Error(data.message || 'Invalid response from IMB payment gateway');
      }

      return {
        orderId: data.order_id,
        paymentUrl: data.payment_url,
        status: data.status || 'created',
      };
    } catch (error: any) {
      console.error('IMB create order error:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return true; // Skip verification if no secret configured
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  parseWebhookPayload(body: any): ImbWebhookPayload {
    return {
      orderId: body.order_id || body.orderId,
      paymentId: body.payment_id || body.paymentId,
      status: body.status === 'success' ? 'success' : body.status === 'failed' ? 'failed' : 'pending',
      amount: body.amount ? body.amount / 100 : 0, // Convert from paise
      transactionId: body.transaction_id || body.transactionId,
      timestamp: body.timestamp || new Date().toISOString(),
    };
  }

  private generateOrderId(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `IMB_${userId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.merchantId);
  }
}
