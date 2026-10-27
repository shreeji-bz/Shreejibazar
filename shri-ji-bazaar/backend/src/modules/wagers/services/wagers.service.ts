import { WagersRepository } from '../repositories/wagers.repository';
import { supabase } from '../../../config/database.config';
import { getSettingsMap } from '../../../common/utils/settings.util';
import {
  PLAY_TYPE_MULTIPLIERS,
  assertSelectionValid,
  isWinner,
  payoutFor,
  PlayType,
} from './wager-settlement';

export class WagersService {
  constructor(private wagersRepo: WagersRepository) {}

  async createWager(data: {
    userId: string;
    gameId: string;
    roundId: string;
    wagerTypeId?: string;
    playType: string;
    selection: string;
    palti?: boolean;
    pointsStaked: number;
    idempotencyKey?: string;
  }): Promise<any> {
    // Enforce minimum stake from settings
    const settings = await getSettingsMap();
    const minStake = parseInt(settings.min_play_points || '0', 10) || 0;
    if (minStake > 0 && data.pointsStaked < minStake) {
      throw new Error(`Minimum stake is ${minStake} points`);
    }

    // Check for idempotency
    if (data.idempotencyKey) {
      const existing = await this.wagersRepo.findByIdempotencyKey(data.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    // Validate game exists and is active
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, status, name')
      .eq('id', data.gameId)
      .single();

    if (gameError || !game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not currently active');
    }

    // Resolve round: use provided roundId if open, otherwise find the active/open round
    let roundId = data.roundId;
    if (!roundId || roundId.trim().length === 0) {
      const { data: activeRound, error: activeError } = await supabase
        .from('rounds')
        .select('id, status, round_number')
        .eq('game_id', data.gameId)
        .eq('status', 'open')
        .gte('start_time', new Date().toISOString())
        .lte('end_time', new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (activeError || !activeRound) {
        // Fallback: any open round for this game
        const { data: anyOpenRound } = await supabase
          .from('rounds')
          .select('id, status, round_number')
          .eq('game_id', data.gameId)
          .eq('status', 'open')
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!anyOpenRound) {
          throw new Error('No open round available for this game. Please try again later.');
        }
        roundId = anyOpenRound.id;
      } else {
        roundId = activeRound.id;
      }
    } else {
      // Validate provided round exists and is open
      const { data: round, error: roundError } = await supabase
        .from('rounds')
        .select('id, status, round_number')
        .eq('id', roundId)
        .single();

      if (roundError || !round) {
        throw new Error('Round not found');
      }

      if (round.status !== 'open') {
        throw new Error('Round is not open for wagering');
      }
    }

    // Potential payout: data-driven (wager_types table) when a wager type is
    // supplied, otherwise fall back to the per-play-type multiplier table.
    let potentialPayout = Math.floor(data.pointsStaked * (PLAY_TYPE_MULTIPLIERS[data.playType as PlayType] ?? 1.8));
    if (data.wagerTypeId) {
      const { data: wagerType, error: wagerTypeError } = await supabase
        .from('wager_types')
        .select('id, payout_multiplier')
        .eq('id', data.wagerTypeId)
        .single();

      if (!wagerTypeError && wagerType) {
        potentialPayout = Math.floor(data.pointsStaked * Number(wagerType.payout_multiplier));
      }
    }

    // Validate play type and selection (pure, testable rules).
    assertSelectionValid(data.playType as PlayType, data.selection);

    // Get round info for description
    const { data: roundInfo } = await supabase
      .from('rounds')
      .select('round_number, games(name)')
      .eq('id', roundId)
      .single();

    // Deduct points from wallet via RPC
    const { error: rpcError } = await supabase.rpc('deduct_wallet_points', {
      p_user_id: data.userId,
      p_amount: data.pointsStaked,
      p_description: `Wager placed on game: ${game.name}, round: ${roundInfo?.round_number || roundId}`,
      p_reference_id: roundId,
      p_reference_type: 'wager',
    });

    if (rpcError) {
      throw new Error('Insufficient points balance');
    }

    // Create wager record
    const wager = await this.wagersRepo.create({
      userId: data.userId,
      gameId: data.gameId,
      roundId: roundId,
      wagerTypeId: data.wagerTypeId || '',
      playType: data.playType,
      selection: data.selection,
      palti: data.palti ?? false,
      pointsStaked: data.pointsStaked,
      potentialPayout,
      status: 'active',
      idempotencyKey: data.idempotencyKey || null,
    });

    return wager;
  }

  async getWagerHistory(userId: string, page: number = 1, limit: number = 20, filters: any = {}) {
    let query = supabase
      .from('wagers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.gameId) {
      query = query.eq('game_id', filters.gameId);
    }
    if (filters.roundId) {
      query = query.eq('round_id', filters.roundId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: (data || []).map((row: any) => this.wagersRepo['mapRow'](row)),
      total: count || 0,
    };
  }

  async getWagerById(id: string): Promise<any> {
    const wager = await this.wagersRepo.findById(id);
    if (!wager) {
      throw new Error('Wager not found');
    }

    // Fetch user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, mobile')
      .eq('id', wager.userId)
      .single();

    if (userError) throw new Error(userError.message);

    return {
      ...wager,
      user: user || null,
    };
  }

  async settleWager(wagerId: string, data: {
    resultText: string;
    isWinner: boolean;
    pointsWon: number;
  }): Promise<any> {
    const wager = await this.wagersRepo.findById(wagerId);
    if (!wager) {
      throw new Error('Wager not found');
    }

    if (wager.status === 'won' || wager.status === 'lost') {
      throw new Error('Wager has already been settled');
    }

    // Credit winnings to wallet if won
    if (data.isWinner && data.pointsWon > 0) {
      await supabase.rpc('credit_wallet_points', {
        p_user_id: wager.userId,
        p_amount: data.pointsWon,
        p_description: `Winnings from wager ${wagerId}`,
        p_reference_id: wagerId,
        p_reference_type: 'wager_win',
      });
    }

    const settled = await this.wagersRepo.settleWager(
      wagerId,
      data.resultText,
      data.isWinner,
      data.pointsWon
    );

    return settled;
  }

  async voidWager(wagerId: string, reason: string): Promise<any> {
    const wager = await this.wagersRepo.findById(wagerId);
    if (!wager) {
      throw new Error('Wager not found');
    }

    if (wager.status !== 'pending' && wager.status !== 'active') {
      throw new Error('Only pending or active wagers can be voided');
    }

    // Refund points to wallet
    if (wager.pointsStaked > 0) {
      await supabase.rpc('credit_wallet_points', {
        p_user_id: wager.userId,
        p_amount: wager.pointsStaked,
        p_description: `Refund for voided wager ${wagerId}. Reason: ${reason || 'N/A'}`,
        p_reference_id: wagerId,
        p_reference_type: 'wager_refund',
      });
    }

    const voided = await this.wagersRepo.voidWager(wagerId, reason);

    return voided;
  }

  async getActiveWagersForRound(roundId: string) {
    return this.wagersRepo.getActiveWagersForRound(roundId);
  }

  async getWagerStats(userId?: string) {
    let query = supabase
      .from('wagers')
      .select('status, result_status, points_staked, potential_payout, points_won', { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const allWagers = data || [];
    const totalWagers = allWagers.length;
    const totalStaked = allWagers.reduce((sum: number, w: any) => sum + (w.points_staked || 0), 0);
    const totalWon = allWagers.reduce((sum: number, w: any) => sum + (w.points_won || 0), 0);
    const wonWagers = allWagers.filter((w: any) => w.status === 'won').length;
    const lostWagers = allWagers.filter((w: any) => w.status === 'lost').length;
    const pendingWagers = allWagers.filter((w: any) => w.status === 'pending' || w.status === 'active').length;
    const voidWagers = allWagers.filter((w: any) => w.status === 'void').length;

    return {
      totalWagers,
      totalStaked,
      totalWon,
      winRate: totalWagers > 0 ? Math.round((wonWagers / totalWagers) * 100) : 0,
      wonWagers,
      lostWagers,
      pendingWagers,
      voidWagers,
      netProfit: totalWon - totalStaked,
    };
  }

  /**
   * Settle every active wager in a round against a declared result. Shared by
   * the admin "settle round" action and the auto-settlement that fires when a
   * result is declared. Credits winners' wallets, marks losers, and returns
   * a per-wager report.
   */
  async settleRound(roundId: string, resultText: string): Promise<{
    totalSettled: number;
    won: number;
    lost: number;
    totalPaid: number;
    wagers: any[];
  }> {
    const activeWagers = await this.wagersRepo.getActiveWagersForRound(roundId);
    let won = 0;
    let lost = 0;
    let totalPaid = 0;
    const wagers: any[] = [];

    for (const wager of activeWagers) {
      const isWin = isWinner(wager.playType as PlayType, wager.selection, resultText, wager.palti ?? false);
      const pointsWon = isWin ? payoutFor(wager.playType as PlayType, wager.selection, wager.pointsStaked, resultText, wager.palti ?? false) : 0;
      try {
        const settled = await this.settleWager(wager.id, { resultText, isWinner: isWin, pointsWon });
        wagers.push(settled);
        if (isWin) {
          won += 1;
          totalPaid += pointsWon;
        } else {
          lost += 1;
        }
      } catch (err) {
        wagers.push({ id: wager.id, error: (err as Error).message });
      }
    }

    return { totalSettled: activeWagers.length, won, lost, totalPaid, wagers };
  }
}
