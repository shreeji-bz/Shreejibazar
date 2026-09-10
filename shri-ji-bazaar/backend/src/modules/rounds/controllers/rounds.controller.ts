import { Request, Response } from 'express';
import { RoundsService } from '../services/rounds.service';

export class RoundsController {
  constructor(private roundsService: RoundsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/upcoming', this.getUpcoming.bind(this));
    this.router.get('/active', this.getActive.bind(this));
    this.router.get('/game/:gameId', this.getByGame.bind(this));
    this.router.get('/results', this.getResults.bind(this));
    this.router.post('/create', this.createRound.bind(this));
    this.router.post('/:id/declare-result', this.declareResult.bind(this));
  }

  async getUpcoming(req: Request, res: Response) {
    try {
      const data = await this.roundsService.getUpcoming(req.query.gameId as string | undefined);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByGame(req: Request, res: Response) {
    try {
      const data = await this.roundsService.getByGameId(req.params.gameId, req.query);
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getResults(req: Request, res: Response) {
    try {
      const data = await this.roundsService.getResults(req.query.gameId as string | undefined, parseInt(req.query.limit as string) || 20);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const data = await this.roundsService.getActive(req.query.gameId as string | undefined);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createRound(req: Request, res: Response) {
    try {
      const data = await this.roundsService.createRound(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async declareResult(req: Request, res: Response) {
    try {
      const { result } = req.body;
      if (!result) return res.status(400).json({ success: false, message: 'Result is required' });

      const data = await this.roundsService.declareResult(req.params.id, result, req.body.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
