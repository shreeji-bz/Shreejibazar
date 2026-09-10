import { Request, Response } from 'express';
import { BonusesService } from '../services/bonuses.service';

export class BonusesController {
  constructor(private bonusesService: BonusesService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/my-claims', this.getMyClaims.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/claim/:id', this.claim.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.patch('/:id', this.update.bind(this));
  }

  async getAll(req: Request, res: Response) {
    try {
      const data = await this.bonusesService.getAll(req.query);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyClaims(req: Request, res: Response) {
    try {
      const data = await this.bonusesService.getUserClaimed(req.body.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await this.bonusesService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async claim(req: Request, res: Response) {
    try {
      const data = await this.bonusesService.claim(req.body.userId, req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await this.bonusesService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await this.bonusesService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
