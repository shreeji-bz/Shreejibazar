import { ResultEntity } from '../entities/result.entity';
import { supabase } from '../../../config/database.config';

export class ResultsService {
  async getLatest(limit = 20): Promise<ResultEntity[]> {
    const { data } = await supabase
      .from('results')
      .select('*, games(name), rounds(round_number)')
      .order('declared_at', { ascending: false })
      .limit(limit);

    return (data || []).map(this.mapRow);
  }

  async getByGame(gameId: string, limit = 20): Promise<ResultEntity[]> {
    const { data } = await supabase
      .from('results')
      .select('*, rounds(round_number)')
      .eq('game_id', gameId)
      .order('declared_at', { ascending: false })
      .limit(limit);

    return (data || []).map(this.mapRow);
  }

  async getByRound(roundId: string): Promise<ResultEntity | null> {
    const { data } = await supabase
      .from('results')
      .select('*, games(name), rounds(round_number)')
      .eq('round_id', roundId)
      .single();

    return data ? this.mapRow(data) : null;
  }

  async declareResult(roundId: string, result: string, adminId: string): Promise<any> {
    const { data: round } = await supabase.from('rounds').select('game_id').eq('id', roundId).single();
    if (!round) throw new Error('Round not found');

    await supabase.from('results').insert({ round_id: roundId, game_id: round.game_id, result });
    await supabase.from('rounds').update({ status: 'result_declared', result, declared_at: new Date().toISOString() }).eq('id', roundId);

    const { io } = require('../../../config/websocket.config');
    if (io) {
      io.to(`game:${round.game_id}`).emit('result:declared', { gameId: round.game_id, roundId, result });
    }

    return { roundId, result };
  }

  private mapRow(row: any): ResultEntity {
    return {
      id: row.id,
      roundId: row.round_id,
      gameId: row.game_id,
      gameName: row.games?.name || 'Unknown',
      roundNumber: row.rounds?.round_number,
      result: row.result,
      declaredAt: row.declared_at,
      createdAt: row.created_at,
    };
  }
}
