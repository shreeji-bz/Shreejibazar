import { RoundEntity } from '../entities/round.entity';
import { supabase } from '../../../config/database.config';

export class RoundsRepository {
  async findById(id: string): Promise<RoundEntity | null> {
    const { data } = await supabase.from('rounds').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  async findByGameId(gameId: string, options: any = {}): Promise<{ data: RoundEntity[]; meta: any }> {
    let query = supabase.from('rounds').select('*', { count: 'exact' }).eq('game_id', gameId);
    if (options.status) query = query.eq('status', options.status);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('start_time', { ascending: false }).range(from, to);
    return { data: (data || []).map((row: any) => this.mapRow(row)), meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) } };
  }

  async findUpcoming(gameId?: string): Promise<RoundEntity[]> {
    // Join games and filter to active games only, so rounds of games that an
    // admin set to inactive/maintenance stop showing on the home page.
    let query = supabase.from('rounds').select('*, games(name, result_time, status)').gte('start_time', new Date().toISOString()).in('status', ['pending', 'open']).eq('games.status', 'active');
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query.order('start_time').limit(100);
    // Flatten the joined game name so the mobile app gets a plain `game_name`
    // field instead of a nested `games` object.
    const rows = (data || []).map((row: any) => {
      const flat: any = { ...row };
      flat.game_name = row.games?.name;
      flat.result_time = row.games?.result_time;
      delete flat.games;
      return flat;
    });
    return rows.map((row: any) => this.mapRow(row, row.game_name));
  }

  async create(data: Partial<RoundEntity> & { gameId: string }): Promise<RoundEntity> {
    const { data: record } = await supabase.from('rounds').insert({
      // Live schema: rounds.status is an enum (open/closed/result_declared) and there
      // is no result_time column; 'pending' is rejected by rounds_status_check.
      game_id: data.gameId, round_number: String(data.roundNumber), start_time: data.startTime, end_time: data.endTime, status: data.status === 'pending' ? 'open' : (data.status || 'open'),
    }).select().single();
    if (!record) throw new Error('Failed to create round');
    return this.mapRow(record);
  }

  async updateStatus(id: string, status: string, result?: string): Promise<RoundEntity> {
    // No declared_at column live; updated_at marks the declaration.
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (result) updateData.result = result;
    const { data: record } = await supabase.from('rounds').update(updateData).eq('id', id).select().single();
    if (!record) throw new Error('Round not found');
    return this.mapRow(record);
  }

  async findAll(options: any = {}): Promise<{ data: RoundEntity[]; meta: any }> {
    let query = supabase.from('rounds').select('*, games(name)', { count: 'exact' });
    if (options.gameId) query = query.eq('game_id', options.gameId);
    if (options.status) query = query.eq('status', options.status);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('start_time', { ascending: false }).range(from, to);
    return {
      data: (data || []).map((row: any) => this.mapRow(row, row.games?.name)),
      meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  }

  async updateRound(id: string, data: any): Promise<RoundEntity> {
    const fields: any = { updated_at: new Date().toISOString() };
    if (data.startTime !== undefined) fields.start_time = data.startTime;
    if (data.endTime !== undefined) fields.end_time = data.endTime;
    if (data.resultTime !== undefined) fields.result_time = data.resultTime;
    if (data.status !== undefined) fields.status = data.status;
    const { data: record, error } = await supabase.from('rounds').update(fields).eq('id', id).select().single();
    if (error || !record) throw new Error('Round not found');
    return this.mapRow(record, record.games?.name);
  }

  async getLatestResults(gameId?: string, limit = 20): Promise<any[]> {
    // Results live on rounds (no results table in live Supabase).
    let query = supabase
      .from('rounds')
      .select('*, games(name)')
      .eq('status', 'result_declared')
      .not('result', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query;
    return (data || []).map((row: any) => this.mapRow(row, row.games?.name));
  }

  async findActive(gameId?: string): Promise<RoundEntity | null> {
    const now = new Date().toISOString();
    // Also require the game to be active so deactivated games vanish from
    // the LIVE MARKET card immediately (join the game and its status).
    let query = supabase.from('rounds').select('*, games(name, result_time, status)').lte('start_time', now).gte('end_time', now).eq('status', 'open').eq('games.status', 'active');
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query.order('start_time', { ascending: false }).limit(1);
    if (data && data.length > 0) {
      const row: any = { ...data[0] };
      row.game_name = data[0].games?.name;
      row.result_time = data[0].games?.result_time;
      delete row.games;
      return this.mapRow(row, row.game_name);
    }
    return null;
  }

  private mapRow(row: any, gameName?: string): RoundEntity {
    return { id: row.id, gameId: row.game_id, gameName: gameName || row.games?.name, roundNumber: row.round_number, startTime: row.start_time, endTime: row.end_time, resultTime: row.result_time, status: row.status, result: row.result, declaredAt: row.declared_at, createdAt: row.created_at, updatedAt: row.updated_at };
  }
}
