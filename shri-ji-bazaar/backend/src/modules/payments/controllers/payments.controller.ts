import { Request, Response } from 'express';
import { PaymentsService } from '../services/payments.service';

export class PaymentsController {
  constructor(private paymentsService: PaymentsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/deposit', this.createDeposit.bind(this));
    this.router.post('/withdraw', this.createWithdrawal.bind(this));
    this.router.get('/', this.getHistory.bind(this));
    this.router.get('/:id', this.getById.bind(this));
  }

  async createDeposit(req: Request, res: Response) {
    try {
      const { amount, method, referenceId, notes } = req.body;
      const data = await this.paymentsService.createDeposit(req.body.userId, amount, method, referenceId, notes);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createWithdrawal(req: Request, res: Response) {
    try {
      const { amount, method, referenceId, notes } = req.body;
      const data = await this.paymentsService.createWithdrawal(req.body.userId, amount, method, referenceId, notes);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
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
      const payment = await this.paymentsService.getPaymentHistory(req.body.userId, 1, 100);
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
}
