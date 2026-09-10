import { Request, Response } from 'express';
import { ResultsService } from '../services/results.service';

export class ResultsController {
  constructor(private resultsService: ResultsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/latest', this.getLatestResults.bind(this));
    this.router.get('/game/:gameId', this.getResultsByGame.bind(this));
    this.router.get('/round/:roundId', this.getResultByRound.bind(this));
  }

  async getLatestResults(req: Request, res: Response) {
    try {
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const data = await this.resultsService.getLatest(limit);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getResultsByGame(req: Request, res: Response) {
    try {
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const data = await this.resultsService.getByGame(req.params.gameId, limit);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getResultByRound(req: Request, res: Response) {
    try {
      const data = await this.resultsService.getByRound(req.params.roundId);
      if (!data) return res.status(404).json({ success: false, message: 'Result not found' });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
