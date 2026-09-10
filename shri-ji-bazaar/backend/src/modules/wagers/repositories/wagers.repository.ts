import { WagerEntity } from '../entities/wager.entity';
import { supabase } from '../../../config/database.config';

export class WagersRepository {
  private mapRow(row: any): WagerEntity {
    return {
      id: row.id,
      userId: row.user_id,
      gameId: row.game_id,
      roundId: row.round_id,
      wagerTypeId: row.wager_type_id,
      playType: row.play_type,
      selection: row.selection,
      pointsStaked: row.points_staked,
      potentialPayout: row.potential_payout,
      status: row.status,
      resultStatus: row.result_status,
      resultText: row.result_text,
      pointsWon: row.points_won,
      pointsRefunded: row.points_refunded,
      idempotencyKey: row.idempotency_key,
      placedAt: row.placed_at,
      settledAt: row.settled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(data: any): Promise<WagerEntity> {
    const { data: record, error } = await supabase
      .from('wagers')
      .insert({
        user_id: data.userId,
        game_id: data.gameId,
        round_id: data.roundId,
        wager_type_id: data.wagerTypeId,
        play_type: data.playType,
        selection: data.selection,
        points_staked: data.pointsStaked,
        potential_payout: data.potentialPayout,
        status: data.status || 'pending',
        result_status: 'pending',
        points_won: 0,
        points_refunded: 0,
        idempotency_key: data.idempotencyKey || null,
      })
      .select()
      .single();

    if (error || !record) {
      throw new Error(error?.message || 'Failed to create wager');
    }

    return this.mapRow(record);
  }

  async findById(id: string): Promise<WagerEntity | null> {
    const { data } = await supabase.from('wagers').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<{ data: WagerEntity[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('wagers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: (data || []).map(this.mapRow),
      total: count || 0,
    };
  }

  async findByRoundId(roundId: string): Promise<WagerEntity[]> {
    const { data, error } = await supabase
      .from('wagers')
      .select('*')
      .eq('round_id', roundId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRow);
  }

  async findByGameId(gameId: string, page: number, limit: number): Promise<{ data: WagerEntity[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('wagers')
      .select('*', { count: 'exact' })
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: (data || []).map(this.mapRow),
      total: count || 0,
    };
  }

  async findByIdempotencyKey(key: string): Promise<WagerEntity | null> {
    const { data } = await supabase.from('wagers').select('*').eq('idempotency_key', key).single();
    return data ? this.mapRow(data) : null;
  }

  async updateStatus(id: string, status: string, resultStatus: string): Promise<WagerEntity> {
    const updateData: any = {
      status,
      result_status: resultStatus,
      updated_at: new Date().toISOString(),
    };

    if (status === 'active') {
      updateData.placed_at = new Date().toISOString();
    }
    if (status === 'won' || status === 'lost') {
      updateData.settled_at = new Date().toISOString();
    }

    const { data: record, error } = await supabase
      .from('wagers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !record) {
      throw new Error(error?.message || 'Failed to update wager status');
    }

    return this.mapRow(record);
  }

  async settleWager(id: string, resultText: string, isWinner: boolean, payout: number): Promise<WagerEntity> {
    const { data: record, error } = await supabase
      .from('wagers')
      .update({
        result_text: resultText,
        result_status: isWinner ? 'won' : 'lost',
        status: isWinner ? 'won' : 'lost',
        points_won: isWinner ? payout : 0,
        settled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !record) {
      throw new Error(error?.message || 'Failed to settle wager');
    }

    return this.mapRow(record);
  }

  async voidWager(id: string, reason: string): Promise<WagerEntity> {
    const { data: existing } = await supabase.from('wagers').select('points_staked').eq('id', id).single();

    const { data: record, error } = await supabase
      .from('wagers')
      .update({
        status: 'void',
        result_status: 'void',
        result_text: reason || 'Wager voided',
        points_refunded: existing?.points_staked || 0,
        settled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !record) {
      throw new Error(error?.message || 'Failed to void wager');
    }

    return this.mapRow(record);
  }

  async getActiveWagersForRound(roundId: string): Promise<WagerEntity[]> {
    const { data, error } = await supabase
      .from('wagers')
      .select('*')
      .eq('round_id', roundId)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRow);
  }

  async countPendingWagers(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('wagers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'active']);

    if (error) throw new Error(error.message);
    return count || 0;
  }
}
