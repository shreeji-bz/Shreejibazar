import { Request, Response } from 'express';
import { PaymentsService } from '../services/payments.service';

export class AdminPaymentsController {
  constructor(private paymentsService: PaymentsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAllPayments.bind(this));
    this.router.get('/pending/deposits', this.getPendingDeposits.bind(this));
    this.router.get('/pending/withdrawals', this.getPendingWithdrawals.bind(this));
    this.router.post('/:id/approve', this.approvePayment.bind(this));
    this.router.post('/:id/reject', this.rejectPayment.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
  }

  async getPendingDeposits(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const data = await this.paymentsService.getPendingDeposits(limit);
      res.json({ success: true, data, count: data.length });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPendingWithdrawals(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const data = await this.paymentsService.getPendingWithdrawals(limit);
      res.json({ success: true, data, count: data.length });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllPayments(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.paymentsService.getAllPayments({ page, limit, type, status, dateFrom, dateTo, search });
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async approvePayment(req: Request, res: Response) {
    try {
      const { adminNotes } = req.body;
      const payment = await this.paymentsService.approveDeposit(req.params.id, req.admin!.id, adminNotes);
      res.json({ success: true, data: payment, message: 'Payment approved successfully' });
    } catch (error: any) {
      const statusCode = error.message === 'Payment not found' ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async rejectPayment(req: Request, res: Response) {
    try {
      const { adminNotes } = req.body;
      if (!adminNotes) {
        res.status(400).json({ success: false, message: 'Admin notes are required for rejection' });
        return;
      }
      const payment = await this.paymentsService.rejectPayment(req.params.id, req.admin!.id, adminNotes);
      res.json({ success: true, data: payment, message: 'Payment rejected' });
    } catch (error: any) {
      const statusCode = error.message === 'Payment not found' ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await this.paymentsService.getStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
