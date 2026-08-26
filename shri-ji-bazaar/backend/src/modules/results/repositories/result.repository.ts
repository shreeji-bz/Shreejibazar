/**
 * Shri Ji Bazaar - Results Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';
import type {
  FindLatestOptions,
  FindByIdResult,
  FindByGameOptions,
  FindByGameResult,
  CreateResultData,
} from '../interfaces/results.interface';

export class ResultsRepository {
  /**
   * Get latest results across all games with pagination.
   * Joins with games and rounds tables to get gameName and roundNumber.
   * Orders by declared_at desc.
   */
  async findLatest(options?: FindLatestOptions): Promise<FindByIdResult[]> {
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const page = Math.max(1, options?.page || 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data } = await supabase
      .from('results')
      .select('id, game_id, round_id, result, declared_at, created_at, games(name), rounds(round_number)')
      .order('declared_at', { ascending: false })
      .range(from, to);

    return (data || []).map((row) => this.mapRow(row));
  }

  /**
   * Get single result with joins by result ID.
   */
  async findById(id: string): Promise<FindByIdResult | null> {
    const { data } = await supabase
      .from('results')
      .select('id, game_id, round_id, result, declared_at, created_at, games(name), rounds(round_number)')
      .eq('id', id)
      .single();

    return data ? this.mapRow(data) : null;
  }

  /**
   * Get results for a specific game with pagination.
   */
  async findByGame(gameId: string, options?: FindByGameOptions): Promise<FindByGameResult> {
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const page = Math.max(1, options?.page || 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // First fetch the paginated data
    const { data } = await supabase
      .from('results')
      .select('id, game_id, round_id, result, declared_at, created_at, games(name), rounds(round_number)')
      .eq('game_id', gameId)
      .order('declared_at', { ascending: false })
      .range(from, to);

    const rows = data || [];

    // Then get the total count for pagination meta
    const { count } = await supabase
      .from('results')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: rows.map((row) => this.mapRow(row)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Insert a new result. declared_at is auto-set to NOW() via Supabase.
   */
  async create(data: CreateResultData): Promise<FindByIdResult> {
    const { data: record } = await supabase
      .from('results')
      .insert({
        game_id: data.gameId,
        round_id: data.roundId,
        result: data.result,
        declared_at: new Date().toISOString(),
      })
      .select('id, game_id, round_id, result, declared_at, created_at, games(name), rounds(round_number)')
      .single();

    if (!record) {
      throw new Error('Failed to create result');
    }

    return this.mapRow(record);
  }

  /**
   * Map a Supabase row to the ResultEntity interface.
   * Handles joined game name and round number.
   */
  private mapRow(row: Record<string, unknown>): FindByIdResult {
    const games = row.games as Record<string, unknown> | null;
    const rounds = row.rounds as Record<string, unknown> | null;

    return {
      id: String(row.id),
      gameId: String(row.game_id),
      gameName: games?.name ? String(games.name) : '',
      roundId: String(row.round_id),
      roundNumber: rounds?.round_number !== undefined ? Number(rounds.round_number) : 0,
      result: String(row.result),
      declaredAt: new Date(String(row.declared_at)),
      createdAt: new Date(String(row.created_at)),
    };
  }
}
