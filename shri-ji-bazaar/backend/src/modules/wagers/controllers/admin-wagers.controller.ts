import { Router, Request, Response } from 'express';
import { WagersService } from '../services/wagers.service';
import { WagersRepository } from '../repositories/wagers.repository';
import { supabase } from '../../../config/database.config';

export class AdminWagersController {
  constructor(private wagersService: WagersService, private wagersRepo: WagersRepository) {}

  async getAllWagers(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.gameId) filters.gameId = req.query.gameId as string;
      if (req.query.roundId) filters.roundId = req.query.roundId as string;
      if (req.query.search) filters.search = req.query.search as string;

      let query = supabase
        .from('wagers')
        .select('*', { count: 'exact' });

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.gameId) query = query.eq('game_id', filters.gameId);
      if (filters.roundId) query = query.eq('round_id', filters.roundId);
      if (filters.search) {
        query = query.or(`selection.ilike.%${filters.search}%,user_id.ilike.%${filters.search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (error) throw new Error(error.message);

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        gameId: row.game_id,
        roundId: row.round_id,
        playType: row.play_type,
        selection: row.selection,
        stake: row.points_staked || 0,
        potentialPayout: row.potential_payout || 0,
        status: row.status,
        resultStatus: row.result_status,
        resultText: row.result_text,
        pointsWon: row.points_won || 0,
        pointsRefunded: row.points_refunded || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        settledAt: row.settled_at,
      }));

      res.json({
        success: true,
        data: mapped,
        meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWagerStats(req: Request, res: Response) {
    try {
      const data = await this.wagersService.getWagerStats();
      res.json({ success: true, data });
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
