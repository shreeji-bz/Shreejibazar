import { SettlementsRepository } from '../repositories/settlements.repository';
import { supabase } from '../../../config/database.config';

export class SettlementsService {
  constructor(private settlementsRepo: SettlementsRepository) {}

  /**
   * Settle a game round: determine winners, create settlement record, credit payouts.
   */
  async settleRound(roundId: string, result: string, adminId: string) {
    // Check for existing settlement to prevent double-processing
    const existing = await this.settlementsRepo.findByRoundId(roundId);
    if (existing) {
      throw new Error(`Round ${roundId} has already been settled`);
    }

    // Load the round to get game info
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('id, game_id, round_number, status')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      throw new Error('Round not found');
    }

    // Load all wagers for this round that are not yet settled
    const { data: wagers, error: wagersError } = await supabase
      .from('wagers')
      .select('*')
      .eq('round_id', roundId)
      .in('result_status', ['pending', null]);

    if (wagersError) {
      throw new Error(`Failed to load wagers: ${wagersError.message}`);
    }

    const wagerList = wagers || [];
    const totalWagers = wagerList.length;
    const totalStaked = wagerList.reduce((sum, w: any) => sum + (Number(w.points_staked) || 0), 0);

    // Create the settlement record
    const settlement = await this.settlementsRepo.create({
      roundId,
      gameId: round.game_id,
      result,
      totalWagers,
      totalStaked,
      totalPayout: 0,
      totalRefund: 0,
      status: 'processing',
      processedBy: adminId,
      processedAt: new Date().toISOString(),
    });

    let totalPayout = 0;
    let totalRefund = 0;
    const errors: string[] = [];

    // Process each wager
    for (const wager of wagerList) {
      try {
        const playType = wager.play_type;
        const selection = String(wager.selection || '');
        const pointsStaked = Number(wager.points_staked) || 0;
        const potentialPayout = Number(wager.potential_payout) || 0;
        const userId = wager.user_id;

        const outcome = this.determineWin(playType, selection, result);
        const isWinner = outcome === 'won';
        const isVoid = outcome === 'void';
        const isLost = outcome === 'lost';

        let pointsWon = 0;
        let pointsRefunded = 0;

        if (isWinner) {
          pointsWon = potentialPayout;
          totalPayout += pointsWon;

          // Credit winning amount to user's wallet
          try {
            await this.creditWallet(userId, pointsWon, `Win for round ${round.round_number} (${roundId})`, `settlement:${settlement.id}`);
          } catch (walletError: any) {
            errors.push(`Failed to credit wallet for user ${userId}: ${walletError.message}`);
          }
        } else if (isVoid) {
          // Refund the staked amount on void
          pointsRefunded = pointsStaked;
          totalRefund += pointsRefunded;

          try {
            await this.creditWallet(userId, pointsRefunded, `Refund for void wager round ${round.round_number} (${roundId})`, `settlement:${settlement.id}`);
          } catch (walletError: any) {
            errors.push(`Failed to refund wallet for user ${userId}: ${walletError.message}`);
          }
        }

        // Create settlement item
        await this.settlementsRepo.createSettlementItem({
          settlementId: settlement.id,
          wagerId: wager.id,
          userId,
          pointsStaked,
          pointsWon,
          pointsRefunded,
          isWinner,
        });

        // Update wager status
        const resultStatus = isWinner ? 'won' : isVoid ? 'void' : 'lost';
        await supabase
          .from('wagers')
          .update({
            result_status: resultStatus,
            result_text: result,
            points_won: pointsWon,
            points_refunded: pointsRefunded,
            settled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', wager.id);
      } catch (itemError: any) {
        errors.push(`Error processing wager ${wager.id}: ${itemError.message}`);
      }
    }

    // Update settlement totals
    const finalStatus = errors.length > 0 ? 'partial' : 'completed';
    await this.settlementsRepo.updateTotals(settlement.id, {
      totalWagers,
      totalStaked,
      totalPayout,
      totalRefund,
    });

    await this.settlementsRepo.updateStatus(settlement.id, finalStatus);

    const settlementItems = await this.settlementsRepo.findItemsBySettlementId(settlement.id);

    return {
      settlement: {
        ...settlement,
        totalWagers,
        totalStaked,
        totalPayout,
        totalRefund,
        status: finalStatus,
      },
      items: settlementItems,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalWagers,
        winners: settlementItems.filter((i) => i.isWinner).length,
        losers: settlementItems.filter((i) => !i.isWinner).length,
        totalPayout,
        totalRefund,
      },
    };
  }

  /**
   * Determine if a wager won, lost, or was voided based on play type, selection, and result.
   */
  determineWin(playType: string, selection: string, result: string): 'won' | 'lost' | 'void' {
    const normalizedSelection = selection.trim();
    const normalizedResult = result.trim().replace(/\s/g, '');

    switch (playType.toLowerCase()) {
      case 'single': {
        // selection must be exactly one digit present in result
        if (normalizedSelection.length !== 1) return 'void';
        return normalizedResult.includes(normalizedSelection) ? 'won' : 'lost';
      }

      case 'jodi': {
        // selection must match the last 2 digits of result
        if (normalizedSelection.length !== 2) return 'void';
        const lastTwo = normalizedResult.slice(-2);
        return normalizedSelection === lastTwo ? 'won' : 'lost';
      }

      case 'panel': {
        // selection must be a permutation of the first 3 digits of result (pana)
        if (normalizedSelection.length !== 3) return 'void';
        const firstThree = normalizedResult.slice(0, 3);
        if (firstThree.length !== 3) return 'void';
        return this.isPermutation(normalizedSelection, firstThree) ? 'won' : 'lost';
      }

      case 'double': {
        // selection must match the first digit or second digit of result
        if (normalizedSelection.length !== 1) return 'void';
        if (normalizedResult.length < 2) return 'void';
        const firstDigit = normalizedResult[0];
        const secondDigit = normalizedResult[1];
        return normalizedSelection === firstDigit || normalizedSelection === secondDigit ? 'won' : 'lost';
      }

      default:
        return 'lost';
    }
  }

  /**
   * Get settlement history for a game with pagination.
   */
  async getSettlementHistory(gameId: string, page = 1, limit = 20) {
    const result = await this.settlementsRepo.getSettlementHistory(gameId, page, limit);

    // Enrich each settlement with round and game info
    const enrichedData = await Promise.all(
      result.data.map(async (settlement) => {
        const { data: roundData } = await supabase
          .from('rounds')
          .select('round_number, games(name, game_type)')
          .eq('id', settlement.roundId)
          .single();

        return {
          ...settlement,
          roundNumber: (roundData as any)?.round_number,
          gameName: (roundData as any)?.games?.name,
          gameType: (roundData as any)?.games?.game_type,
        };
      }),
    );

    return {
      data: enrichedData,
      total: result.total,
    };
  }

  /**
   * Get all settlements with pagination.
   */
  async getAll(page = 1, limit = 20) {
    return this.settlementsRepo.getAll(page, limit);
  }

  /**
   * Get settlement details with items.
   */
  async getSettlementDetail(settlementId: string) {
    const settlement = await this.settlementsRepo.findById(settlementId);
    if (!settlement) throw new Error('Settlement not found');

    const items = await this.settlementsRepo.findItemsBySettlementId(settlementId);

    const { data: roundData } = await supabase
      .from('rounds')
      .select('round_number, games(name)')
      .eq('id', settlement.roundId)
      .single();

    return {
      ...settlement,
      roundNumber: (roundData as any)?.round_number,
      gameName: (roundData as any)?.games?.name,
      items,
    };
  }

  /**
   * Retry a failed settlement.
   */
  async retrySettlement(settlementId: string, adminId: string) {
    const settlement = await this.settlementsRepo.findById(settlementId);
    if (!settlement) throw new Error('Settlement not found');

    if (settlement.status === 'completed') {
      throw new Error('Settlement is already completed');
    }

    // Re-run settlement for the same round
    return this.settleRound(settlement.roundId, settlement.result, adminId);
  }

  /**
   * Credit points to a user's wallet via the RPC function.
   */
  private async creditWallet(userId: string, amount: number, description: string, referenceId: string): Promise<void> {
    if (amount <= 0) return;

    const { error } = await supabase.rpc('credit_wallet_points', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_reference_id: referenceId,
    });

    if (error) {
      throw new Error(error.message || 'Failed to credit wallet');
    }
  }

  /**
   * Check if two strings are permutations of each other (same characters, different order).
   */
  private isPermutation(str1: string, str2: string): boolean {
    if (str1.length !== str2.length) return false;
    const sorted1 = str1.split('').sort().join('');
    const sorted2 = str2.split('').sort().join('');
    return sorted1 === sorted2;
  }
}
