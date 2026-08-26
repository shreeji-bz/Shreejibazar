import { supabase } from '../../../config/database.config';
import type { FindAllOptions, CreateActivityData } from '../interfaces/activity.interface';

export class ActivityRepository {
  async findAll(options: FindAllOptions): Promise<{ data: any[]; meta: any }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('activities')
      .select(
        `
        *,
        users:user_id (name),
        games:game_id (name),
        rounds:round_id (round_number)
        `,
        { count: 'exact' }
      );

    if (options.userId) query = query.eq('user_id', options.userId);
    if (options.gameId) query = query.eq('game_id', options.gameId);
    if (options.status) query = query.eq('status', options.status);

    if (options.fromDate) query = query.gte('created_at', options.fromDate);
    if (options.toDate) query = query.lte('created_at', options.toDate);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const formatted = (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      userName: a.users?.name || null,
      gameId: a.game_id,
      gameName: a.games?.name || null,
      roundId: a.round_id,
      roundNumber: a.rounds?.round_number || null,
      playType: a.play_type,
      selection: a.selection,
      points: a.points,
      result: a.result,
      status: a.status,
      idempotencyKey: a.idempotency_key,
      createdAt: a.created_at,
    }));

    return { data: formatted, meta: { total: count || 0, page, limit } };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('activities')
      .select(
        `
        *,
        users:user_id (name),
        games:game_id (name),
        rounds:round_id (round_number)
        `
      )
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.users?.name || null,
      gameId: data.game_id,
      gameName: data.games?.name || null,
      roundId: data.round_id,
      roundNumber: data.rounds?.round_number || null,
      playType: data.play_type,
      selection: data.selection,
      points: data.points,
      result: data.result,
      status: data.status,
      idempotencyKey: data.idempotency_key,
      createdAt: data.created_at,
    };
  }

  async create(data: CreateActivityData): Promise<any> {
    const { data: record, error } = await supabase
      .from('activities')
      .insert({
        user_id: data.userId,
        game_id: data.gameId,
        round_id: data.roundId,
        play_type: data.playType,
        selection: data.selection,
        points: data.points,
        status: 'pending',
        idempotency_key: data.idempotencyKey || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return record;
  }

  async updateResult(id: string, result: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .update({
        result,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async findByIdempotencyKey(key: string): Promise<any | null> {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    return data || null;
  }
}
