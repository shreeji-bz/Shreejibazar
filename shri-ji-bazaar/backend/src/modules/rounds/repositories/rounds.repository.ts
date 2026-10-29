import { RoundEntity } from '../entities/round.entity';
import { supabase } from '../../../config/database.config';

export class RoundsRepository {
  async findById(id: string): Promise<RoundEntity | null> {
    const { data } = await supabase.from('rounds').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  /**
   * Date-wise round guarantee: make sure an OPEN round exists for the given
   * day + game so the next day's market is playable without waiting for an
   * admin. Idempotent (matches on game_id + exact start_time).
   */
  async ensureRoundForDate(
    gameId: string,
    startTime: string,
    endTime: string,
    resultTime?: string
  ): Promise<RoundEntity | null> {
    const { data: existing } = await supabase
      .from('rounds')
      .select('id')
      .eq('game_id', gameId)
      .eq('start_time', startTime)
      .limit(1)
      .maybeSingle();
    if (existing) return null; // already generated

    const roundNumber = Date.now() % 100000;
    const { data: record, error } = await supabase
      .from('rounds')
      .insert({
        game_id: gameId,
        round_number: roundNumber,
        start_time: startTime,
        end_time: endTime,
        ...(resultTime ? { result_time: resultTime } : {}),
        status: 'open',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return record ? this.mapRow(record) : null;
  }

  async findByGameId(gameId: string, options: any = {}): Promise<{ data: RoundEntity[]; meta: any }> {
    let query = supabase.from('rounds').select('*', { count: 'exact' }).eq('game_id', gameId);
    if (options.status) query = query.eq('status', options.status);
    if (options.date) {
      // Date-wise filtering: rounds whose start falls on the given local date
      // (YYYY-MM-DD). Interpreted in the server's timezone (IST in dev), which
      // matches how the daily seed rounds are generated.
      const day = new Date(`${options.date}T00:00:00`);
      if (!isNaN(day.getTime())) {
        const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
        query = query.gte('start_time', day.toISOString()).lt('start_time', next.toISOString());
      }
    }
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('start_time', { ascending: false }).range(from, to);
    return { data: (data || []).map((row: any) => this.mapRow(row)), meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) } };
  }

  async findUpcoming(gameId?: string, date?: string): Promise<RoundEntity[]> {
    // Join games and filter to active games only, so rounds of games that an
    // admin set to inactive/maintenance stop showing on the home page.
    // When [date] (YYYY-MM-DD) is given, only that day's markets are returned
    // (home shows "today's upcoming", NOT the next 20+ days).
    const now = new Date();
    let from: string;
    let to: string;
    if (date) {
      from = new Date(`${date}T00:00:00`).toISOString();
      to = new Date(`${date}T23:59:59.999`).toISOString();
    } else {
      from = now.toISOString();
      to = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // default: next 24h
    }
    let query = supabase.from('rounds').select('*, games(name, opening_time, closing_time, result_time, status)').gte('start_time', from).lte('start_time', to).in('status', ['pending', 'open']).eq('games.status', 'active');
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query.order('start_time').limit(100);
    // Flatten the joined game fields so the mobile app gets plain
    // game_name / open_time / close_time / result_time instead of a nested
    // `games` object.
    const rows = (data || []).map((row: any) => {
      const flat: any = { ...row };
      flat.game_name = row.games?.name;
      flat.open_time = row.games?.opening_time;
      flat.close_time = row.games?.closing_time;
      flat.result_time = row.games?.result_time;
      delete flat.games;
      return flat;
    });
    return rows.map((row: any) => this.mapRow(row, row.game_name));
  }

  /**
   * All rounds currently RUNNING (start <= now <= end) on active games —
   * powers the multi-card LIVE MARKET list on the home screen. Each row
   * carries the game's schedule (open/close/result time) so the client can
   * render "Time Left" + "Result Time" without extra calls.
   */
  async findLive(limit = 20): Promise<RoundEntity[]> {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('rounds')
      .select('*, games(name, opening_time, closing_time, result_time, status)')
      .eq('status', 'open')
      .lte('start_time', now)
      .gte('end_time', now)
      .eq('games.status', 'active')
      .order('start_time')
      .limit(limit);
    const rows = (data || []).map((row: any) => {
      const flat: any = { ...row };
      flat.game_name = row.games?.name;
      flat.open_time = row.games?.opening_time;
      flat.close_time = row.games?.closing_time;
      flat.result_time = row.games?.result_time;
      delete flat.games;
      return flat;
    });
    return rows.map((row: any) => this.mapRow(row, row.game_name));
  }

  /**
   * Latest declared result per game -> { gameId: { result, at, game_name } }.
   * Used to stamp "Last Result: 09" onto live cards without an extra call
   * per round.
   */
  async lastResultByGame(): Promise<Record<string, { result: string; at: string; game_name?: string }>> {
    const { data } = await supabase
      .from('rounds')
      .select('game_id, result, updated_at, games(name)')
      .eq('status', 'result_declared')
      .not('result', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(200);
    const out: Record<string, { result: string; at: string; game_name?: string }> = {};
    for (const r of data || []) {
      const row = r as any;
      if (!out[row.game_id]) {
        out[row.game_id] = { result: String(row.result), at: row.updated_at, game_name: row.games?.name };
      }
    }
    return out;
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
    // Results live on rounds (no results table in live Supabase). Join the
    // game's schedule so the LAST RESULTS cards can show Open/Close time.
    let query = supabase
      .from('rounds')
      .select('*, games(name, opening_time, closing_time, result_time)')
      .eq('status', 'result_declared')
      .not('result', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query;
    const rows = (data || []).map((row: any) => {
      const flat: any = { ...row };
      flat.open_time = row.games?.opening_time;
      flat.close_time = row.games?.closing_time;
      flat.result_time = row.games?.result_time;
      delete flat.games;
      return flat;
    });
    return rows.map((row: any) => this.mapRow(row, row.game_name));
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
    const base: any = {
      id: row.id,
      gameId: row.game_id,
      gameName: gameName || row.games?.name || row.game_name,
      roundNumber: row.round_number,
      startTime: row.start_time,
      endTime: row.end_time,
      resultTime: row.result_time,
      status: row.status,
      result: row.result,
      openTime: row.open_time || row.opening_time,
      closeTime: row.close_time || row.closing_time,
      declaredAt: row.declared_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    // The mobile app reads the flat `game_name` / `game_id` fields on rounds
    // (home upcoming cards, live market). Emit them alongside the camelCase
    // entity fields so both consumers work.
    if (row.game_name != null) base.game_name = row.game_name;
    if (row.game_id != null) base.game_id = row.game_id;
    return base;
  }
}
