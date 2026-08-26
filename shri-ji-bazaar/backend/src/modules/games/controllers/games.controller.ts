import { Request, Response } from 'express';
import { GamesService } from '../services/games.service';

export class GamesController {
  constructor(private gameService: GamesService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/popular', this.getPopular.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.patch('/:id', this.update.bind(this));
    this.router.patch('/:id/status', this.toggleStatus.bind(this));
    this.router.delete('/:id', this.delete.bind(this));
  }

  async getAll(req: Request, res: Response) {
    try {
      const data = await this.gameService.getAll(req.query);
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPopular(req: Request, res: Response) {
    try {
      const data = await this.gameService.getPopular();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await this.gameService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await this.gameService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await this.gameService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!['active', 'inactive', 'maintenance'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be active, inactive, or maintenance' });
      }
      const data = await this.gameService.toggleStatus(req.params.id, status);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.gameService.delete(req.params.id);
      res.json({ success: true, message: 'Game deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
