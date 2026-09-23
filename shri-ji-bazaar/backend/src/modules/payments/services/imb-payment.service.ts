import crypto from 'crypto';
import FormData from 'form-data';

export interface ImbCreateOrderResponse {
  orderId: string;
  paymentUrl: string;
  paytmLink?: string;
  bhimLink?: string;
  checkLink?: string;
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
  private readonly userToken: string;
  private readonly redirectUrl: string;
  private readonly webhookUrl: string;
  private readonly webhookSecret: string;

  constructor() {
    this.baseUrl = process.env.IMB_BASE_URL || 'https://api.imbpay.in';
    this.userToken = process.env.IMB_USER_TOKEN || '';
    this.redirectUrl = process.env.IMB_REDIRECT_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/imb/callback`;
    this.webhookUrl = process.env.IMB_WEBHOOK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/api/v1/payments/imb/webhook`;
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
    if (!this.userToken) {
      throw new Error('IMB payment gateway is not configured');
    }

    const orderId = this.generateOrderId(params.userId);

    const form = new FormData();
    form.append('customer_mobile', params.userMobile);
    form.append('user_token', this.userToken);
    form.append('amount', params.amount.toFixed(2));
    form.append('order_id', orderId);
    form.append('redirect_url', this.redirectUrl);
    form.append('remark1', params.userEmail || params.userMobile);
    form.append('remark2', params.userName);

    try {
      console.log(`IMB create order: ${this.baseUrl}/v2/create-order, amount=${params.amount.toFixed(2)}, order=${orderId}`);

      // Try url-encoded first (many Indian payment gateways prefer this over multipart)
      const urlEncodedBody = new URLSearchParams();
      urlEncodedBody.set('customer_mobile', params.userMobile);
      urlEncodedBody.set('user_token', this.userToken);
      urlEncodedBody.set('amount', params.amount.toFixed(2));
      urlEncodedBody.set('order_id', orderId);
      urlEncodedBody.set('redirect_url', this.redirectUrl);
      urlEncodedBody.set('remark1', params.userEmail || params.userMobile);
      urlEncodedBody.set('remark2', params.userName);

      const response = await fetch(`${this.baseUrl}/v2/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: urlEncodedBody.toString(),
      });

      const responseText = await response.text();
      console.log('IMB create order raw response status:', response.status);
      console.log('IMB create order raw response body:', responseText);

      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('IMB create order: response is not JSON');
        throw new Error('Invalid response from IMB payment gateway: non-JSON response');
      }

      if (!response.ok || !data.result?.payment_url || !data.result?.orderId) {
        throw new Error(data.message || 'Invalid response from IMB payment gateway');
      }

      return {
        orderId: data.result.orderId,
        paymentUrl: data.result.payment_url,
        paytmLink: data.result.paytm_link,
        bhimLink: data.result.bhim_link,
        checkLink: data.result.check_link,
        status: data.result.status || 'created',
      };
    } catch (error: any) {
      console.error('IMB create order error:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return true;
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
    // IMB sends form-urlencoded; body may already be parsed by express, or result may be a JSON string
    const raw = body as Record<string, any>;

    // Parse the 'result' field if it's a JSON string (IMB sends it this way for form-urlencoded webhooks)
    let result: Record<string, any> = {};
    if (raw.result) {
      if (typeof raw.result === 'string') {
        try {
          result = JSON.parse(raw.result);
        } catch {
          result = {};
        }
      } else if (typeof raw.result === 'object') {
        result = raw.result;
      }
    }

    // IMB uses uppercase status: SUCCESS / FAILED / PENDING
    const rawStatus = (raw.status || '').toString().toUpperCase();
    const txnStatus = (result.txnStatus || '').toString().toUpperCase();
    let status: 'success' | 'failed' | 'pending' = 'pending';
    if (rawStatus === 'SUCCESS' && txnStatus === 'COMPLETED') {
      status = 'success';
    } else if (rawStatus === 'FAILED' || txnStatus === 'FAILED' || txnStatus === 'FAILED') {
      status = 'failed';
    }

    // Amount may be integer (rupees) or string
    const rawAmount = result.amount ?? raw.amount;
    const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount || '0');

    return {
      orderId: raw.order_id || raw.orderId || result.orderId,
      paymentId: raw.payment_id || result.txnId,
      status,
      amount: isNaN(amount) ? 0 : amount,
      transactionId: raw.transaction_id || result.utr || result.txnId,
      timestamp: raw.date || raw.timestamp || result.date || new Date().toISOString(),
    };
  }

  private generateOrderId(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `IMB_${userId.substring(0, 8)}_${timestamp}_${random}`.toUpperCase();
  }

  isConfigured(): boolean {
    return !!this.userToken;
  }
}
