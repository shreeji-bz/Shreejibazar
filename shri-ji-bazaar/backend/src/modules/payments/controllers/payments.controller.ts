import { Request, Response } from 'express';
import { PaymentsService } from '../services/payments.service';
import { ImbPaymentService } from '../services/imb-payment.service';

export class PaymentsController {
  constructor(private paymentsService: PaymentsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/deposit', this.createDeposit.bind(this));
    this.router.post('/withdraw', this.createWithdrawal.bind(this));
    this.router.get('/', this.getHistory.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/imb/create-order', this.createImbOrder.bind(this));
  }

  async createDeposit(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { amount, method, referenceId, notes } = req.body;
      const methodMap: Record<string, string> = {
        'upi': 'upi',
        'bank transfer': 'bank_transfer',
        'paytm': 'paytm',
        'phonepe': 'phonepe',
        'cash': 'cash',
        'points': 'points',
        'admin': 'admin',
        'imps (imb)': 'imps',
        'imps': 'imps',
      };
      const methodKey = typeof method === 'string' ? method.toLowerCase().trim() : method;
      const normalizedMethod = methodMap[methodKey] || methodKey;
      const data = await this.paymentsService.createDeposit(userId, amount, normalizedMethod, referenceId, notes);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createWithdrawal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { amount, method, referenceId, notes, bankDetails } = req.body;
      const methodMap: Record<string, string> = {
        'upi': 'upi',
        'bank transfer': 'bank_transfer',
        'paytm': 'paytm',
        'phonepe': 'phonepe',
        'cash': 'cash',
        'points': 'points',
        'admin': 'admin',
        'imps (imb)': 'imps',
        'imps': 'imps',
      };
      const methodKey = typeof method === 'string' ? method.toLowerCase().trim() : method;
      const normalizedMethod = methodMap[methodKey] || methodKey;
      const data = await this.paymentsService.createWithdrawal(userId, amount, normalizedMethod, referenceId, notes, bankDetails);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await this.paymentsService.getPaymentHistory(userId, page, limit, type, status);
      res.json({
        success: true,
        data: result.data,
        meta: { total: result.total, page, limit, totalPages: Math.ceil(result.total / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const payment = await this.paymentsService.getPaymentHistory(userId, 1, 100);
      const found = payment.data.find((p) => p.id === req.params.id);
      if (!found) {
        res.status(404).json({ success: false, message: 'Payment not found' });
        return;
      }
      res.json({ success: true, data: found });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // IMB Payment Gateway: Create IMPS payment order
  async createImbOrder(req: Request, res: Response) {
    try {
      const { amount, description } = req.body;
      const user = (req as any).user; // Set by authenticateToken middleware

      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({ success: false, message: 'Valid amount is required' });
        return;
      }

      const imbService = new ImbPaymentService();
      const result = await imbService.createOrder({
        amount,
        userId: user.id,
        userName: user.name || 'User',
        userMobile: user.mobile || '',
        userEmail: user.email || undefined,
        description: description || `Deposit via IMPS`,
      });

      // Create a pending deposit record in our system
      const deposit = await this.paymentsService.createDeposit(
        user.id,
        amount,
        'imps',
        undefined,
        `IMPS payment via IMB gateway - Order: ${result.orderId}`
      );

      res.status(201).json({
        success: true,
        data: {
          orderId: result.orderId,
          paymentUrl: result.paymentUrl,
          amount,
          depositId: deposit.id,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // IMB Payment Gateway: Browser callback (redirect after payment)
  async imbCallback(req: Request, res: Response) {
    const { order_id, status, transaction_id } = req.query;

    console.log(`IMB callback received: order=${order_id}, status=${status}, txn=${transaction_id}`);

    // Return an HTML page that will be shown in the WebView
    const isSuccess = status === 'success' || status === 'completed';
    const title = isSuccess ? 'Payment Successful' : 'Payment Failed';
    const message = isSuccess
      ? 'Your IMPS payment has been received. Crediting your wallet...'
      : 'Your IMPS payment could not be processed. Please try again.';
    const color = isSuccess ? '#25C85A' : '#E53935';

    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #120C05;
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
      color: ${color};
    }
    p {
      font-size: 16px;
      color: #aaa;
      margin-bottom: 24px;
    }
    .order-id {
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${isSuccess ? '✅' : '❌'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="order-id">Order: ${order_id}</div>
  </div>
  <script>
    // Store result in localStorage so Flutter can poll for it
    localStorage.setItem('imb_payment_status', '${isSuccess ? 'success' : 'failed'}');
    localStorage.setItem('imb_order_id', '${order_id}');
    localStorage.setItem('imb_transaction_id', '${transaction_id || ''}');
  </script>
</body>
</html>`);
  }

  // IMB Payment Gateway: Webhook for server-to-server payment notifications
  async imbWebhook(req: Request, res: Response) {
    try {
      const imbService = new ImbPaymentService();

      // IMB sends form-urlencoded data; express json parser won't parse it
      // Use req.body directly (express.urlencoded() should be configured in app.ts)
      console.log('IMB webhook received:', JSON.stringify(req.body));

      const payload = imbService.parseWebhookPayload(req.body);
      console.log(`IMB webhook: order=${payload.orderId}, status=${payload.status}, amount=${payload.amount}, txnId=${payload.transactionId}`);

      // Look up payment by notes (which contains the IMB order ID)
      const { supabase } = require('../../../config/database.config');
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .ilike('notes', `%${payload.orderId}%`)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .maybeSingle();

      if (!payment) {
        console.log(`IMB webhook: no pending deposit found for order ${payload.orderId} - already processed or not found`);
        res.status(200).json({ success: true });
        return;
      }

      if (payload.status === 'success') {
        // Approve the deposit and credit the wallet
        await this.paymentsService.approveDeposit(payment.id, 'imb_gateway', `IMPS payment confirmed - Txn: ${payload.transactionId}`);
        console.log(`IMB deposit approved: paymentId=${payment.id}, userId=${payment.user_id}, amount=${payment.amount}`);
      } else if (payload.status === 'failed') {
        await this.paymentsService.rejectPayment(payment.id, 'imb_gateway', 'IMPS payment failed');
        console.log(`IMB deposit rejected: paymentId=${payment.id}`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('IMB webhook error:', error);
      res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  }
}
