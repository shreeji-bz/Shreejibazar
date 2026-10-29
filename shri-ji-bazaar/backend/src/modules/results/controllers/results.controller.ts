import { Request, Response } from 'express';
import { ResultsService } from '../services/results.service';

export class ResultsController {
  constructor(private resultsService: ResultsService, private router: any, private adminOnly = false) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/latest', this.getLatestResults.bind(this));
    this.router.get('/report', this.getReport.bind(this));
    this.router.get('/game/:gameId', this.getResultsByGame.bind(this));
    this.router.get('/round/:roundId', this.getResultByRound.bind(this));
    this.router.get('/', this.getAllResults.bind(this));
    this.router.post('/declare', this.declareResult.bind(this));
    // Game-scoped declare is admin-only (registered on adminRouter, which runs
    // authenticateAdmin; the public router must not expose it).
    if (this.adminOnly) this.router.post('/declare-by-game', this.declareByGame.bind(this));
  }

  /** Jantri report: declared results grouped by day + game in a date range. */
  async getReport(req: Request, res: Response) {
    try {
      const from = (req.query.from || req.query.dateFrom) as string | undefined;
      const to = (req.query.to || req.query.dateTo) as string | undefined;
      const data = await this.resultsService.getReport(from, to);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
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

  async getAllResults(req: Request, res: Response) {
    try {
      const result = await this.resultsService.listAll(req.query);
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async declareResult(req: Request, res: Response) {
    try {
      const { roundId, result } = req.body;
      if (!roundId || !result) return res.status(400).json({ success: false, message: 'roundId and result are required' });
      const data = await this.resultsService.declareResult(roundId, result, req.admin?.id || req.body.adminId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async declareByGame(req: Request, res: Response) {
    try {
      const { gameId, result } = req.body;
      if (!gameId || !result) return res.status(400).json({ success: false, message: 'gameId and result are required' });
      const data = await this.resultsService.declareByGame(gameId, result, req.admin?.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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
