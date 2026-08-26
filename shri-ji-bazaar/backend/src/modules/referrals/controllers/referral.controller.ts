import { Request, Response } from 'express';
import { ReferralService } from '../services/referral.service';

export class ReferralController {
  constructor(private referralService: ReferralService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
  }
  async getAll(req: Request, res: Response) {
    try { const data = await this.referralService.getAll(req.query); res.json({ success: true, ...data }); }
    catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.referralService.getStats(userId);
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
}
