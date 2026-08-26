/**
 * Shri Ji Bazaar - Points Controller
 */

import { Router, Request, Response } from 'express';
import { PointsService } from '../services/points.service';

export class PointsController {
  private router: Router;

  constructor(private pointsService: PointsService) {
    this.router = Router();
    this.initializeRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private initializeRoutes(): void {
    this.router.get('/wallet/:userId', this.getWallet.bind(this));
    this.router.get('/transactions', this.getTransactions.bind(this));
    this.router.post('/credit', this.creditPoints.bind(this));
    this.router.post('/debit', this.debitPoints.bind(this));
    this.router.post('/adjust', this.adjustPoints.bind(this));
  }

  private async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data = await this.pointsService.getWallet(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  private async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string | undefined;

      const data = await this.pointsService.getTransactions({ userId, type, page, limit });
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  private async creditPoints(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, description, referenceId, referenceType } = req.body;
      const transaction = await this.pointsService.creditPoints(userId, amount, description, {
        referenceId,
        referenceType,
      });
      res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  private async debitPoints(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, description, referenceId, referenceType } = req.body;
      const transaction = await this.pointsService.debitPoints(userId, amount, description, {
        referenceId,
        referenceType,
      });
      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  private async adjustPoints(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, description } = req.body;
      const transaction = await this.pointsService.adjustPoints(userId, amount, description);
      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
