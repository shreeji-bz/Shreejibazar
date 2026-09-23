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
    let query = supabase.from('rounds').select('*, games(name)').gte('start_time', new Date().toISOString()).in('status', ['pending', 'open']);
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query.order('start_time').limit(100);
    return (data || []).map((row: any) => this.mapRow(row, row.games?.name));
  }

  async create(data: Partial<RoundEntity> & { gameId: string }): Promise<RoundEntity> {
    const { data: record } = await supabase.from('rounds').insert({
      game_id: data.gameId, round_number: data.roundNumber, start_time: data.startTime, end_time: data.endTime, result_time: data.resultTime, status: data.status || 'pending',
    }).select().single();
    if (!record) throw new Error('Failed to create round');
    return this.mapRow(record);
  }

  async updateStatus(id: string, status: string, result?: string): Promise<RoundEntity> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (result) updateData.result = result;
    if (status === 'result_declared') updateData.declared_at = new Date().toISOString();
    const { data: record } = await supabase.from('rounds').update(updateData).eq('id', id).select().single();
    if (!record) throw new Error('Round not found');
    return this.mapRow(record);
  }

  async getLatestResults(gameId?: string, limit = 20): Promise<any[]> {
    let query = supabase.from('results').select('*, rounds(round_number, game_id, games(name))').order('declared_at', { ascending: false }).limit(limit);
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query;
    return data || [];
  }

  async findActive(gameId?: string): Promise<RoundEntity | null> {
    const now = new Date().toISOString();
    let query = supabase.from('rounds').select('*').lte('start_time', now).gte('end_time', now).eq('status', 'open');
    if (gameId) query = query.eq('game_id', gameId);
    const { data } = await query.order('start_time', { ascending: false }).limit(1);
    if (data && data.length > 0) return this.mapRow(data[0]);
    return null;
  }

  private mapRow(row: any, gameName?: string): RoundEntity {
    return { id: row.id, gameId: row.game_id, gameName: gameName || row.games?.name, roundNumber: row.round_number, startTime: row.start_time, endTime: row.end_time, resultTime: row.result_time, status: row.status, result: row.result, declaredAt: row.declared_at, createdAt: row.created_at, updatedAt: row.updated_at };
  }
}
