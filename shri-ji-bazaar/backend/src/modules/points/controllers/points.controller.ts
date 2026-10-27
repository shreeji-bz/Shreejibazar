import { Request, Response } from 'express';
import { PointsService } from '../services/points.service';
import { PointsRepository } from '../repositories/points.repository';

export class PointsController {
  private isAdmin: boolean;
  constructor(private pointsService: PointsService, private pointsRepo: PointsRepository, private router: any, isAdmin = false) {
    this.isAdmin = isAdmin;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/leaderboard', this.getLeaderboard.bind(this));
    if (!this.isAdmin) {
      this.router.get('/wallet', this.getWallet.bind(this));
      this.router.get('/transactions', this.getTransactions.bind(this));
      this.router.post('/award', this.awardPoints.bind(this));
      this.router.post('/deduct', this.deductPoints.bind(this));
    } else {
      this.router.get('/', this.listAllWallets.bind(this));
      this.router.post('/adjust', this.adjustPoints.bind(this));
    }
  }

  async listAllWallets(_req: Request, res: Response) {
    try {
      const data = await this.pointsService.listAllWallets();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async adjustPoints(req: Request, res: Response) {
    try {
      const { userId, amount, direction, reason } = req.body;
      const data = await this.pointsService.adjustPoints({ userId, amount, direction, reason });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getWallet(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const data = await this.pointsService.getWallet(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await this.pointsService.getTransactions(userId, req.query);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const data = await this.pointsService.getLeaderboard(limit);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async awardPoints(req: Request, res: Response) {
    try {
      const { userId, amount, type, description, referenceId } = req.body;
      const data = await this.pointsService.awardPoints(userId, amount, type, description, referenceId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deductPoints(req: Request, res: Response) {
    try {
      const { userId, amount, description, referenceId } = req.body;
      const data = await this.pointsService.deductPoints(userId, amount, description, referenceId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
