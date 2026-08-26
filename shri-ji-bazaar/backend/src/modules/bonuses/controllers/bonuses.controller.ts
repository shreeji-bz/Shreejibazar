import { Router, Request, Response, NextFunction } from 'express';
import { BonusService } from '../services/bonuses.service';
import type { IBonusService } from '../interfaces/bonuses.interface';
import { authenticateToken } from '../../../common/middleware/auth.middleware';

export class BonusController {
  constructor(private bonusService: IBonusService, router: Router) {
    this.initializeRoutes(router);
  }

  private initializeRoutes(router: Router) {
    router.get('/', this.getAll);
    router.get('/:id', this.getById);
    router.post('/', this.create);
    router.patch('/:id', this.update);
    router.delete('/:id', this.delete);

    router.post('/claim', this.claim);
    router.get('/my-claims', this.getMyClaims);
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.bonusService.findAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error: any) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const bonus = await this.bonusService.findById(req.params.id);
      if (!bonus) {
        res.status(404).json({ success: false, message: 'Bonus not found' });
        return;
      }
      res.json({ success: true, data: bonus });
    } catch (error: any) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bonus = await this.bonusService.create(req.body);
      res.status(201).json({ success: true, data: bonus });
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bonus = await this.bonusService.update(req.params.id, req.body);
      res.json({ success: true, data: bonus });
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.bonusService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  async claim(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { bonusId } = req.body;
      if (!bonusId) {
        res.status(400).json({ success: false, message: 'bonusId is required' });
        return;
      }
      const result = await this.bonusService.claim(req.user.id, bonusId);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  async getMyClaims(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const claims = await this.bonusService.getUserClaims(req.user.id);
      res.json({ success: true, data: claims });
    } catch (error: any) {
      next(error);
    }
  }
}
