import { RoundsRepository } from '../repositories/rounds.repository';
import { supabase } from '../../../config/database.config';

export class RoundsService {
  constructor(private roundsRepo: RoundsRepository) {}

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
