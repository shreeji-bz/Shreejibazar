import { Request, Response } from 'express';
import { PointsService } from '../services/points.service';
import { PointsRepository } from '../repositories/points.repository';

export class PointsController {
  constructor(private pointsService: PointsService, private pointsRepo: PointsRepository, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/wallet', this.getWallet.bind(this));
    this.router.get('/transactions', this.getTransactions.bind(this));
    this.router.get('/leaderboard', this.getLeaderboard.bind(this));
    this.router.post('/award', this.awardPoints.bind(this));
    this.router.post('/deduct', this.deductPoints.bind(this));
  }

  async getWallet(req: Request, res: Response) {
    try {
      const data = await this.pointsService.getWallet(req.body.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const result = await this.pointsService.getTransactions(req.body.userId, req.query);
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
