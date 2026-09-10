import { Request, Response } from 'express';
import { SettlementsService } from '../services/settlements.service';
import { settleRoundSchema, settlementQuerySchema } from '../dto/settlement.dto';

export class SettlementsController {
  constructor(private settlementsService: SettlementsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/round/:roundId', this.settleRound.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/history/:gameId', this.getHistory.bind(this));
    this.router.post('/:id/retry', this.retry.bind(this));
  }

  async settleRound(req: Request, res: Response) {
    try {
      const { error, value } = settleRoundSchema.validate(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });

      const data = await this.settlementsService.settleRound(value.roundId, value.result, req.body.adminId || req.body.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.message?.includes('already been settled')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await this.settlementsService.getSettlementDetail(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Settlement not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { error, value } = settlementQuerySchema.validate(req.query);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });

      const page = value.page || 1;
      const limit = value.limit || 20;

      let data;
      if (value.gameId) {
        data = await this.settlementsService.getSettlementHistory(value.gameId, page, limit);
      } else {
        data = await this.settlementsService.getAll(page, limit);
      }

      res.json({ success: true, data: data.data, meta: { total: data.total, page, limit } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const { error, value } = settlementQuerySchema.validate({ ...req.query, gameId: req.params.gameId });
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });

      const page = value.page || 1;
      const limit = value.limit || 20;
      const data = await this.settlementsService.getSettlementHistory(req.params.gameId, page, limit);

      res.json({ success: true, data: data.data, meta: { total: data.total, page, limit } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async retry(req: Request, res: Response) {
    try {
      const adminId = req.body.adminId || req.body.userId;
      const data = await this.settlementsService.retrySettlement(req.params.id, adminId);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Settlement not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Settlement is already completed') {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
