import { Request, Response } from 'express';
import { ReferralsService } from '../services/referrals.service';
import { ReferralRepository } from '../repositories/referrals.repository';
import { PointsService } from '../../points/services/points.service';
import { PointsRepository } from '../../points/repositories/points.repository';

export class ReferralsController {
  constructor(private referralsService: ReferralsService, private router: any) {
    this.initializeRoutes();
  }

  private static async getAll(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query;
      const options: any = {};
      if (status) options.status = status;
      if (page) options.page = parseInt(page as string);
      if (limit) options.limit = parseInt(limit as string);
      const data = await (req.app.locals.referralsService as ReferralsService).findAll(options);
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  private static async getById(req: Request, res: Response) {
    try {
      const data = await (req.app.locals.referralsService as ReferralsService).findById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  private static async create(req: Request, res: Response) {
    try {
      const { referredUserId, points } = req.body;
      const referrerId = (req as any).user?.id;
      if (!referrerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const data = await (req.app.locals.referralsService as ReferralsService).create(
        referrerId,
        referredUserId,
        points
      );
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  private static async complete(req: Request, res: Response) {
    try {
      const data = await (req.app.locals.referralsService as ReferralsService).completeReferral(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  private static async getByUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const data = await (req.app.locals.referralsService as ReferralsService).getByUser(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  initializeRoutes() {
    this.router.get('/', ReferralsController.getAll);
    this.router.get('/:id', ReferralsController.getById);
    this.router.post('/', ReferralsController.create);
    this.router.patch('/:id/complete', ReferralsController.complete);
    this.router.get('/user/me', ReferralsController.getByUser);
  }
}
