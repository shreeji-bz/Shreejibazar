import { RoundsRepository } from '../repositories/rounds.repository';
import { supabase } from '../../../config/database.config';
import { RoundEntity } from '../entities/round.entity';

export class RoundsService {
  /**
   * Optional settle callback injected by the composition root so that
   * declaring a result also settles the round's wagers, without the rounds
   * module importing the wagers module (which would be a circular dep).
   */
  private settleRoundFn?: (roundId: string, result: string) => Promise<unknown>;

  constructor(private roundsRepo: RoundsRepository) {}

  setSettleRound(fn: (roundId: string, result: string) => Promise<unknown>) {
    this.settleRoundFn = fn;
  }

  async getUpcoming(gameId?: string) {
    return this.roundsRepo.findUpcoming(gameId);
  }

  async getByGameId(gameId: string, options: any) {
    return this.roundsRepo.findByGameId(gameId, options);
  }

  async getResults(gameId?: string, limit = 20) {
    return this.roundsRepo.getLatestResults(gameId, limit);
  }

  async getActive(gameId?: string) {
    return this.roundsRepo.findActive(gameId);
  }

  async declareResult(roundId: string, result: string, adminId: string) {
    const round = await this.roundsRepo.findById(roundId);
    if (!round) throw new Error('Round not found');

    const updated = await this.roundsRepo.updateStatus(roundId, 'result_declared', result);

    const { error } = await supabase.from('results').insert({
      round_id: roundId,
      game_id: round.gameId,
      result,
    });

    if (error) throw new Error('Failed to create result');

    // Settle this round's open wagers against the result so winners are paid.
    if (this.settleRoundFn) {
      try {
        await this.settleRoundFn(roundId, result);
      } catch (e) {
        // Settlement should never block result declaration from being recorded.
        console.error(`Rounds: auto-settlement failed for round ${roundId}:`, e);
      }
    }

    // Date-wise auto-advance: open tomorrow's round for this game.
    try {
      await this.ensureNextDayRound(round);
    } catch (e) {
      console.error(`Rounds: next-day round generation failed for round ${roundId}:`, e);
    }

    const { io } = require('../../../config/websocket.config');
    if (io) {
      io.to(`game:${round.gameId}`).emit('result:declared', {
        gameId: round.gameId,
        roundId,
        result,
        declaredAt: new Date().toISOString(),
      });
    }

    return updated;
  }

  /**
   * When a round's result is declared, make sure the next day's market for the
   * same game is open and playable. Reads the game's schedule (opening_time /
   * result_time) and creates a new 'open' round one day later.
   */
  private async ensureNextDayRound(round: RoundEntity): Promise<RoundEntity | null> {
    const { data: game } = await supabase
      .from('games')
      .select('opening_time, result_time')
      .eq('id', round.gameId)
      .single();
    if (!game?.opening_time) return null;

    const openDate = new Date(round.startTime);
    openDate.setDate(openDate.getDate() + 1);

    const open = openDate.toISOString();
    const close = new Date(openDate.getTime() + 30 * 60 * 1000).toISOString();
    return this.roundsRepo.ensureRoundForDate(round.gameId, open, close, game.result_time);
  }

  async createRound(data: { gameId: string; startTime: string; endTime: string }) {
    const game = await supabase.from('games').select('result_time').eq('id', data.gameId).single();
    if (!game.data) throw new Error('Game not found');

    const roundNumber = Date.now();

    return this.roundsRepo.create({
      gameId: data.gameId,
      roundNumber,
      startTime: data.startTime,
      endTime: data.endTime,
      resultTime: game.data.result_time,
      status: 'pending',
    });
  }
}
