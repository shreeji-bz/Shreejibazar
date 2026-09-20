import { Request, Response } from 'express';
import { ReferralsService } from '../services/referrals.service';

export class ReferralsController {
  constructor(private referralsService: ReferralsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAllReferrals.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
    this.router.get('/list', this.getList.bind(this));
    this.router.post('/apply', this.applyReferral.bind(this));
  }

  async getAllReferrals(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
      const data = await this.referralsService.getAllReferrals(page, limit);
      res.json({ success: true, data, total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const data = await this.referralsService.getStats(req.body.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getList(req: Request, res: Response) {
    try {
      const data = await this.referralsService.getList(req.body.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async applyReferral(req: Request, res: Response) {
    try {
      const { referralCode } = req.body;
      const data = await this.referralsService.applyReferral(req.body.userId, referralCode);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
