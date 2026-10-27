import { ResultEntity } from '../entities/result.entity';
import { supabase } from '../../../config/database.config';

// Live Supabase has no `results` table: results are stored inline on
// rounds (rounds.result + status='result_declared'). declared_at does not
// exist either; updated_at is the declaration timestamp.
export class ResultsService {
  async getLatest(limit = 20): Promise<ResultEntity[]> {
    const { data } = await supabase
      .from('rounds')
      .select('*, games(name)')
      .eq('status', 'result_declared')
      .not('result', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    return (data || []).map(this.mapRow);
  }

  async getByGame(gameId: string, limit = 20): Promise<ResultEntity[]> {
    const { data } = await supabase
      .from('rounds')
      .select('*, games(name)')
      .eq('game_id', gameId)
      .eq('status', 'result_declared')
      .not('result', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit);

    return (data || []).map(this.mapRow);
  }

  async listAll(options: any = {}): Promise<{ data: ResultEntity[]; meta: any }> {
    let query = supabase.from('rounds').select('*, games(name)', { count: 'exact' });
    if (options.gameId) query = query.eq('game_id', options.gameId);
    if (options.roundId) query = query.eq('id', options.roundId);
    if (options.status) query = query.eq('status', options.status);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('updated_at', { ascending: false }).range(from, to);
    return {
      data: (data || []).map(this.mapRow),
      meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  }

  async getByRound(roundId: string): Promise<ResultEntity | null> {
    const { data } = await supabase
      .from('rounds')
      .select('*, games(name)')
      .eq('id', roundId)
      .single();

    return data ? this.mapRow(data) : null;
  }

  async declareResult(roundId: string, result: string, adminId?: string): Promise<any> {
    const { data: round } = await supabase.from('rounds').select('id, game_id').eq('id', roundId).single();
    if (!round) throw new Error('Round not found');

    await supabase
      .from('rounds')
      .update({ status: 'result_declared', result, updated_at: new Date().toISOString() })
      .eq('id', roundId);

    const { io } = require('../../../config/websocket.config');
    if (io) {
      io.to(`game:${round.game_id}`).emit('result:declared', { gameId: round.game_id, roundId, result });
    }

    return { roundId, result, adminId };
  }

  private mapRow(row: any): ResultEntity {
    return {
      id: row.id,
      roundId: row.id,
      gameId: row.game_id,
      gameName: row.games?.name || 'Unknown',
      roundNumber: row.round_number,
      result: row.result,
      declaredAt: row.updated_at,
      createdAt: row.created_at,
    };
  }
}
