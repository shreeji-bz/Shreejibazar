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

  // Game-scoped declare: find the game's open round (latest start_time) and
  // mark it result_declared; if none exists, insert one so every market
  // accumulates its own result history (rounds table, no results table live).
  async declareByGame(gameId: string, result: string, adminId?: string): Promise<any> {
    const { data: game } = await supabase.from('games').select('id, slug, opening_time, closing_time, result_time').eq('id', gameId).single();
    if (!game) throw new Error('Game not found');

    const openRound = await this.findOpenRound(gameId);

    let roundId: string;
    let created = false;
    if (openRound) {
      roundId = openRound.id;
      const { error } = await supabase
        .from('rounds')
        .update({ status: 'result_declared', result, updated_at: new Date().toISOString() })
        .eq('id', roundId);
      if (error) throw new Error(error.message);
    } else {
      const { data: record, error } = await supabase
        .from('rounds')
        .insert({
          game_id: gameId,
          round_number: String(Date.now()),
          start_time: this.composeTime(game.opening_time),
          end_time: this.composeTime(game.closing_time),
          status: 'result_declared',
          result,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error || !record) throw new Error(error ? error.message : 'Failed to create round');
      roundId = record.id;
      created = true;
    }

    const { io } = require('../../../config/websocket.config');
    if (io) {
      io.to(`game:${gameId}`).emit('result:declared', {
        gameId,
        roundId,
        result,
        declaredAt: new Date().toISOString(),
      });
    }

    return { gameId, roundId, result, created, adminId };
  }

  private async findOpenRound(gameId: string): Promise<any | null> {
    const { data } = await supabase
      .from('rounds')
      .select('id')
      .eq('game_id', gameId)
      .eq('status', 'open')
      .order('start_time', { ascending: false })
      .limit(1);
    return data && data.length > 0 ? data[0] : null;
  }

  // opening_time/closing_time are 'HH:MM' app-local; interpret as today's date.
  private composeTime(hhmm: string | null): string {
    if (!hhmm) return new Date().toISOString();
    const [y, m, d] = new Date().toLocaleDateString('en-CA').split('-');
    return new Date(`${y}-${m}-${d}T${hhmm}:00`).toISOString();
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
