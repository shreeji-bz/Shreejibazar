import { SettlementEntity } from '../entities/settlement.entity';
import { SettlementItemEntity } from '../entities/settlement_item.entity';
import { ISettlementsRepository } from '../interfaces/settlements.interface';
import { supabase } from '../../../config/database.config';

export class SettlementsRepository implements ISettlementsRepository {
  async create(data: any): Promise<SettlementEntity> {
    const { data: record, error } = await supabase
      .from('settlements')
      .insert({
        round_id: data.roundId,
        game_id: data.gameId,
        result: data.result,
        total_wagers: data.totalWagers ?? 0,
        total_staked: data.totalStaked ?? 0,
        total_payout: data.totalPayout ?? 0,
        total_refund: data.totalRefund ?? 0,
        status: data.status ?? 'processing',
        processed_by: data.processedBy ?? null,
        processed_at: data.processedAt ?? null,
      })
      .select()
      .single();

    if (error || !record) {
      throw new Error(`Failed to create settlement: ${error?.message ?? 'unknown error'}`);
    }

    return this.mapSettlementRow(record);
  }

  async createSettlementItem(data: any): Promise<SettlementItemEntity> {
    const { data: record, error } = await supabase
      .from('settlement_items')
      .insert({
        settlement_id: data.settlementId,
        wager_id: data.wagerId,
        user_id: data.userId,
        points_staked: data.pointsStaked,
        points_won: data.pointsWon ?? 0,
        points_refunded: data.pointsRefunded ?? 0,
        is_winner: data.isWinner ?? false,
      })
      .select()
      .single();

    if (error || !record) {
      throw new Error(`Failed to create settlement item: ${error?.message ?? 'unknown error'}`);
    }

    return this.mapItemRow(record);
  }

  async findById(id: string): Promise<SettlementEntity | null> {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapSettlementRow(data) : null;
  }

  async findByRoundId(roundId: string): Promise<SettlementEntity | null> {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('round_id', roundId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapSettlementRow(data) : null;
  }

  async findItemsBySettlementId(settlementId: string): Promise<SettlementItemEntity[]> {
    const { data, error } = await supabase
      .from('settlement_items')
      .select('*')
      .eq('settlement_id', settlementId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => this.mapItemRow(row));
  }

  async updateStatus(id: string, status: string): Promise<SettlementEntity> {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'completed' || status === 'failed') {
      updates.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('settlements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update settlement status: ${error?.message ?? 'not found'}`);
    return this.mapSettlementRow(data);
  }

  async updateTotals(
    id: string,
    totals: { totalWagers: number; totalStaked: number; totalPayout: number; totalRefund: number },
  ): Promise<SettlementEntity> {
    const { data, error } = await supabase
      .from('settlements')
      .update({
        total_wagers: totals.totalWagers,
        total_staked: totals.totalStaked,
        total_payout: totals.totalPayout,
        total_refund: totals.totalRefund,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update settlement totals: ${error?.message ?? 'not found'}`);
    return this.mapSettlementRow(data);
  }

  async getSettlementHistory(
    gameId: string,
    page: number,
    limit: number,
  ): Promise<{ data: SettlementEntity[]; total: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, limit);
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, count, error } = await supabase
      .from('settlements')
      .select('*', { count: 'exact' })
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return {
      data: (data || []).map((row: any) => this.mapSettlementRow(row)),
      total: count || 0,
    };
  }

  async getAll(page: number, limit: number): Promise<{ data: SettlementEntity[]; total: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, limit);
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, count, error } = await supabase
      .from('settlements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return {
      data: (data || []).map((row: any) => this.mapSettlementRow(row)),
      total: count || 0,
    };
  }

  private mapSettlementRow(row: any): SettlementEntity {
    return {
      id: row.id,
      roundId: row.round_id,
      gameId: row.game_id,
      result: row.result,
      totalWagers: row.total_wagers ?? 0,
      totalStaked: row.total_staked ?? 0,
      totalPayout: row.total_payout ?? 0,
      totalRefund: row.total_refund ?? 0,
      status: row.status,
      processedBy: row.processed_by ?? null,
      processedAt: row.processed_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapItemRow(row: any): SettlementItemEntity {
    return {
      id: row.id,
      settlementId: row.settlement_id,
      wagerId: row.wager_id,
      userId: row.user_id,
      pointsStaked: row.points_staked ?? 0,
      pointsWon: row.points_won ?? 0,
      pointsRefunded: row.points_refunded ?? 0,
      isWinner: row.is_winner ?? false,
      createdAt: row.created_at,
    };
  }
}
