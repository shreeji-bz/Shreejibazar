import { Request, Response } from 'express';
import { WagersService } from '../services/wagers.service';
import { WagersRepository } from '../repositories/wagers.repository';
import joi from 'joi';
import {
  placeWagerSchema,
  voidWagerSchema,
  settleWagerSchema,
  getWagersQuerySchema,
} from '../dto/wager.dto';

export class WagersController {
  constructor(private wagersService: WagersService, private wagersRepo: WagersRepository, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/', this.placeWager.bind(this));
    this.router.get('/', this.getUserWagers.bind(this));
    this.router.get('/stats', this.getWagerStats.bind(this));
    this.router.get('/:id', this.getWagerById.bind(this));
    this.router.get('/round/:roundId', this.getWagersByRound.bind(this));
    this.router.post('/:id/void', this.voidWager.bind(this));
    this.router.post('/round/:roundId/settle', this.settleRoundWagers.bind(this));
  }

  private validate(schema: joi.ObjectSchema, data: any): void {
    const { error } = schema.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
  }

  async placeWager(req: Request, res: Response) {
    try {
      this.validate(placeWagerSchema, req.body);
      const data = await this.wagersService.createWager({
        userId: req.body.userId,
        gameId: req.body.gameId,
        roundId: req.body.roundId,
        wagerTypeId: req.body.wagerTypeId,
        playType: req.body.playType,
        selection: req.body.selection,
        pointsStaked: req.body.pointsStaked,
        idempotencyKey: req.body.idempotencyKey,
      });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Insufficient points balance') {
        res.status(400).json({ success: false, message: error.message, code: 'INSUFFICIENT_BALANCE' });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  }

  async getUserWagers(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.gameId) filters.gameId = req.query.gameId as string;
      if (req.query.roundId) filters.roundId = req.query.roundId as string;

      const result = await this.wagersService.getWagerHistory(req.body.userId, page, limit, filters);
      res.json({
        success: true,
        data: result.data,
        meta: { total: result.total, page, limit, totalPages: Math.ceil(result.total / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWagerById(req: Request, res: Response) {
    try {
      const data = await this.wagersService.getWagerById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Wager not found') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }

  async getWagersByRound(req: Request, res: Response) {
    try {
      const wagers = await this.wagersRepo.findByRoundId(req.params.roundId);
      res.json({ success: true, data: wagers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async voidWager(req: Request, res: Response) {
    try {
      this.validate(voidWagerSchema, req.body);
      const data = await this.wagersService.voidWager(req.params.id, req.body.reason || '');
      res.json({ success: true, data, message: 'Wager voided successfully. Points refunded.' });
    } catch (error: any) {
      if (error.message === 'Wager not found') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  }

  async settleRoundWagers(req: Request, res: Response) {
    try {
      const { resultText, winningSelection } = req.body;
      if (!resultText) {
        return res.status(400).json({ success: false, message: 'resultText is required' });
      }

      const activeWagers = await this.wagersService.getActiveWagersForRound(req.params.roundId);
      const settledWagers: any[] = [];

      for (const wager of activeWagers) {
        const isWinner = this.checkWagerWin(wager, winningSelection || resultText);
        const payout = isWinner ? wager.potentialPayout : 0;

        try {
          const settled = await this.wagersService.settleWager(wager.id, {
            resultText,
            isWinner,
            pointsWon: payout,
          });
          settledWagers.push(settled);
        } catch (err) {
          settledWagers.push({ id: wager.id, error: (err as Error).message });
        }
      }

      res.json({
        success: true,
        data: {
          totalSettled: settledWagers.length,
          wagers: settledWagers,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWagerStats(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const data = await this.wagersService.getWagerStats(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  private checkWagerWin(wager: any, resultText: string): boolean {
    const resultDigits = resultText.replace(/\s/g, '').split('');
    const selection = wager.selection.trim();

    switch (wager.playType) {
      case 'single':
        return resultDigits.includes(selection);
      case 'double':
        return resultText.replace(/\s/g, '').includes(selection);
      case 'jodi':
        return resultText.replace(/\s/g, '').includes(selection);
      case 'panel':
        return selection.split('').every((digit: string) => resultDigits.includes(digit));
      default:
        return false;
    }
  }
}
