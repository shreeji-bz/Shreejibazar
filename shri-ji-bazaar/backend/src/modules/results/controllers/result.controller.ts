import { Request, Response } from 'express';
import { ResultsService } from '../services/result.service';

export class ResultController {
  constructor(private resultsService: ResultsService, private router: any) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/latest', this.getLatest.bind(this));
    this.router.get('/game/:gameId', this.getByGame.bind(this));
    this.router.get('/:id', this.getById.bind(this));
  }

  async getLatest(req: Request, res: Response) {
    try {
      const { page = '1', limit = '20' } = req.query;
      const data = await this.resultsService.findLatest({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { page = '1', limit = '20' } = req.query;
      const data = await this.resultsService.findByGame(gameId, {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await this.resultsService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
