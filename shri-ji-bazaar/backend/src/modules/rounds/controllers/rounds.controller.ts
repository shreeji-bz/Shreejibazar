import { Request, Response } from 'express';
import { RoundsService } from '../services/rounds.service';
import { RoundEntity } from '../entities/round.entity';

export class RoundsController {
  constructor(private roundsService: RoundsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/game/:gameId', this.getByGameId.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.post('/:id/close', this.closeRound.bind(this));
    this.router.post('/:id/result', this.declareResult.bind(this));
  }

  async getByGameId(req: Request, res: Response) {
    try {
      const data = await this.roundsService.findByGame(req.params.gameId, req.query);
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data: RoundEntity = await this.roundsService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: RoundEntity = await this.roundsService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async closeRound(req: Request, res: Response) {
    try {
      const data: RoundEntity = await this.roundsService.closeRound(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async declareResult(req: Request, res: Response) {
    try {
      const { result } = req.body;
      const data: RoundEntity = await this.roundsService.declareResult(req.params.id, result);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
