/**
 * Shri Ji Bazaar - Rounds Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';
import { RoundEntity, RoundListResult } from '../entities/round.entity';
import { IRoundsRepository } from '../interfaces/rounds.interface';

export class RoundsRepository implements IRoundsRepository {
  async findByGame(gameId: string, options: any = {}): Promise<RoundListResult> {
    let query = supabase
      .from('rounds')
      .select('*, games(name)', { count: 'exact' })
      .eq('game_id', gameId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const page = Math.max(1, parseInt(options?.page || '1'));
    const limit = Math.min(100, parseInt(options?.limit || '20'));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await query
      .order('start_time', { ascending: false })
      .range(from, to);

    return {
      data: (data || []).map((row: any) => this.mapRow(row)),
      meta: { total: count || 0, page, limit },
    };
  }

  async findById(id: string): Promise<RoundEntity | null> {
    const { data } = await supabase
      .from('rounds')
      .select('*, games(name)')
      .eq('id', id)
      .single();

    if (!data) return null;
    return this.mapRow(data);
  }

  async create(data: Partial<RoundEntity>): Promise<RoundEntity> {
    const { data: record } = await supabase
      .from('rounds')
      .insert({
        game_id: data.gameId,
        round_number: data.roundNumber,
        start_time: data.startTime?.toISOString(),
        end_time: data.endTime?.toISOString(),
        status: 'open',
      })
      .select('*, games(name)')
      .single();

    if (!record) throw new Error('Failed to create round');
    return this.mapRow(record);
  }

  async closeRound(id: string): Promise<RoundEntity> {
    const { data: record } = await supabase
      .from('rounds')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, games(name)')
      .single();

    if (!record) throw new Error('Failed to close round');
    return this.mapRow(record);
  }

  async declareResult(id: string, result: string): Promise<RoundEntity> {
    const { data: record } = await supabase
      .from('rounds')
      .update({ result, status: 'result_declared', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, games(name)')
      .single();

    if (!record) throw new Error('Failed to declare result');
    return this.mapRow(record);
  }

  private mapRow(row: any): RoundEntity {
    return {
      id: row.id,
      gameId: row.game_id,
      gameName: row.games?.name || '',
      roundNumber: row.round_number,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      result: row.result,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
